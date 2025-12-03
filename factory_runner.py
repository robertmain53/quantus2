#!/usr/bin/env python3
import csv
import json
import os
import sys
import subprocess
from pathlib import Path
from difflib import get_close_matches
from typing import Any, Dict, List, Optional
from datetime import date, datetime   # <--- datetime added
import shutil 
from dotenv import load_dotenv
load_dotenv()

from openai import OpenAI

# ------------ CONFIGURABLE CONSTANTS ------------

CSV_PATH = Path("data/calc.csv")
PROMPTS_DIR = Path("generated/prompts")
OUTPUT_DIR = Path("data/configs")
BUILD_LOG_PATH = Path("build.log")  # <-- change this if your build log has another name/path

INPUT_DIR = Path("input")        # <--- NEW
MODEL_NAME = "gpt-5-mini"
ROWS_TO_PROCESS = 5  # starting row + 4 next rows (if available)

# column 9 (1-based) -> index 8 (0-based)
DATE_COLUMN_INDEX = 8

SUPPORTED_CONTEXT_EXTENSIONS = {
    ".txt", ".text", ".md", ".markdown",
    ".json", ".html", ".htm",
    ".xml", ".yaml", ".yml",
    ".pdf",
}


def backup_csv(csv_path: Path) -> None:
    """
    Create a timestamped backup of the CSV before overwriting it.
    Example: data/calc.csv.bak-2025-12-03-09-41-22
    """
    if not csv_path.exists():
        return  # nothing to back up

    timestamp = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
    backup_path = csv_path.with_suffix(csv_path.suffix + f".bak-{timestamp}")
    shutil.copy2(csv_path, backup_path)
    print(f"Backup created: {backup_path}")


# ------------ HELPER FUNCTIONS: CSV ------------

def load_csv_rows(csv_path: Path) -> List[List[str]]:
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found: {csv_path}")
    with csv_path.open(newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        rows = list(reader)
    if not rows:
        raise ValueError("CSV file is empty.")
    return rows


def get_data_rows(rows: List[List[str]]) -> List[List[str]]:
    """
    Assumes first row is header, returns data rows.
    """
    if len(rows) <= 1:
        return []
    return rows[1:]


def write_csv_rows(rows: List[List[str]], csv_path: Path) -> None:
    # NEW: safe backup before overwriting
    backup_csv(csv_path)

    with csv_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerows(rows)



def extract_slug_from_row(row: List[str]) -> Optional[str]:
    """
    Find the first cell containing a '/' and return
    the last non-empty segment after '/'.
    """
    for cell in row:
        cell = cell.strip()
        if "/" in cell:
            parts = [p for p in cell.split("/") if p]
            if parts:
                return parts[-1]
    return None


# ------------ HELPER FUNCTIONS: PROMPT & ZIP ------------

def find_best_prompt_file(slug: str, prompts_dir: Path) -> Optional[Path]:
    """
    Find the file in generated/prompts whose name best matches the slug.
    Priority:
      1. Filenames containing the slug.
      2. Closest filename by difflib.get_close_matches.
    """
    if not prompts_dir.exists():
        raise FileNotFoundError(f"Prompts directory not found: {prompts_dir}")

    files = [p for p in prompts_dir.glob("**/*") if p.is_file()]
    if not files:
        return None

    # Direct contains match
    slug_lower = slug.lower()
    contains_matches = [
        f for f in files if slug_lower in f.name.lower()
    ]
    if contains_matches:
        # If multiple, pick shortest filename (usually more precise)
        return sorted(contains_matches, key=lambda x: len(x.name))[0]

    # Fuzzy match by name
    names = [f.name for f in files]
    close = get_close_matches(slug, names, n=1, cutoff=0.1)
    if close:
        best_name = close[0]
        for f in files:
            if f.name == best_name:
                return f
    return None


def load_json(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def find_zip_path_in_json(data: Any) -> Optional[str]:
    """
    Recursively look for a string containing '.zip' in the JSON.
    Returns the first match found.
    """
    if isinstance(data, dict):
        for v in data.values():
            result = find_zip_path_in_json(v)
            if result:
                return result
    elif isinstance(data, list):
        for item in data:
            result = find_zip_path_in_json(item)
            if result:
                return result
    elif isinstance(data, str):
        if ".zip" in data:
            return data
    return None


# ------------ HELPER FUNCTIONS: OPENAI ------------


def call_openai_with_prompt_and_context_files(
    client: OpenAI, prompt_text: str, context_files: List[Path]
) -> str:
    """
    Call gpt-5-mini with:
      - the main prompt text
      - the contents of any context files (e.g. manifest.json),
        inlined as input_text blocks.

    No file uploads: all context is sent as plain text.
    """
    content: List[Dict[str, Any]] = []

    for p in context_files:
        try:
            text = p.read_text(encoding="utf-8", errors="ignore")

            # Optional: truncate very large files
            max_len = 20000
            if len(text) > max_len:
                text = text[-max_len:]

            if p.name == "manifest.json":
                # Special handling for SERP manifest
                wrapped = (
                    "You are given a JSON manifest describing search results "
                    "from a search engine (SERP) for this calculator's keyword. "
                    "Each result includes competitor pages.\n\n"
                    "Use this manifest ONLY to:\n"
                    "- infer the main and secondary search intent of the user;\n"
                    "- understand what tools, UI patterns, and information competitors provide;\n"
                    "- make your tool and its explanation more complete, clearer, and more useful than what they likely offer.\n\n"
                    "IMPORTANT RESTRICTIONS:\n"
                    "- Do NOT mention or reference any competitor by name, brand, or URL;\n"
                    "- Do NOT copy text or structure verbatim;\n"
                    "- Do NOT list or describe specific sites.\n\n"
                    "Here is the SERP manifest JSON:\n"
                    "----- BEGIN SERP_MANIFEST -----\n"
                    f"{text}\n"
                    "----- END SERP_MANIFEST -----\n"
                )
            else:
                # Generic context file (if you add more later)
                wrapped = (
                    f"You are given a supplementary context file named {p.name}. "
                    "Use it only to improve accuracy, completeness, and professional tone, "
                    "without copying text verbatim or referring to any internal file names.\n\n"
                    "----- BEGIN CONTEXT_FILE -----\n"
                    f"{text}\n"
                    "----- END CONTEXT_FILE -----\n"
                )

            content.append({
                "type": "input_text",
                "text": wrapped,
            })

        except Exception as e:
            print(f"WARNING: Could not read file {p}: {e}")

    # Add the main prompt last so it can refer back to context
    content.append({
        "type": "input_text",
        "text": prompt_text,
    })

    response = client.responses.create(
        model=MODEL_NAME,
        input=[
            {
                "role": "user",
                "content": content,
            }
        ],
    )

    return response.output_text




def extract_json_block_with_version(text: str) -> str:
    """
    From the model output, keep only the JSON object delimited by the
    outermost {} that contains `"version"` somewhere inside.
    Strategy:
      - Find the first '{' that appears before '"version"'
      - From there, find the matching closing '}' by brace counting
      - Return that substring
    If anything fails, return original text as a fallback.
    """
    version_index = text.find('"version"')
    if version_index == -1:
        # No "version" found, best effort: try first { ... last }
        first_brace = text.find("{")
        last_brace = text.rfind("}")
        if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
            return text[first_brace:last_brace + 1]
        return text

    # Find '{' before "version"
    first_brace = text.rfind("{", 0, version_index)
    if first_brace == -1:
        first_brace = text.find("{")
        if first_brace == -1:
            return text

    # Brace matching
    depth = 0
    end_index = None
    for i in range(first_brace, len(text)):
        ch = text[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                end_index = i
                break

    if end_index is None:
        # Fallback to last '}'
        last_brace = text.rfind("}")
        if last_brace != -1 and last_brace > first_brace:
            end_index = last_brace
        else:
            return text

    return text[first_brace:end_index + 1]


# ------------ HELPER FUNCTIONS: BUILD LOG ------------

def load_build_log(path: Path) -> Optional[str]:
    if not path.exists():
        print(f"WARNING: build log not found at {path}. No date will be written to calc.csv.")
        return None
    return path.read_text(encoding="utf-8", errors="ignore")


def slug_has_build_error(build_log: str, slug: str) -> bool:
    """
    Determine if a given slug caused a build error based on the build log.

    Tailored for logs like:
      Error: config file business/accounting/discounted-cash-flow-calculator: ...

    Logic:
      - Scan every line of the log.
      - If the line contains an "error" marker (e.g. "error", "build error occurred",
        "failed") and also contains the slug (or very common variants),
        we consider that slug as having caused a build error.
    """
    slug_variants = [
        slug,
        f"/{slug}",
        f"{slug}.json",
    ]

    for line in build_log.splitlines():
        line_lower = line.lower()

        # Only consider lines that clearly indicate an error
        if (
            "error:" in line_lower
            or "build error occurred" in line_lower
            or "failed to" in line_lower
            or "exited with 1" in line_lower
        ):
            # Check if the slug or a common variant appears in the same line
            for sv in slug_variants:
                if sv in line:
                    return True

    return False


# ------------ HELPER FUNCTIONS: GIT ------------

def run_git_commands(start_row_number: int) -> None:
    """
    Run:
      git add .
      git commit -m "row {start_row_number}"
      git push -u origin main
    """
    subprocess.run(["git", "add", "."], check=True)
    commit_msg = f"row {start_row_number}"
    subprocess.run(["git", "commit", "-m", commit_msg], check=True)
    subprocess.run(["git", "push", "-u", "origin", "main"], check=True)


# ------------ MAIN LOGIC ------------

def main() -> None:
    # Determine starting row (1-based, data rows only)
    if len(sys.argv) > 1:
        try:
            start_row_number = int(sys.argv[1])
        except ValueError:
            print("First argument must be an integer (starting row number).")
            sys.exit(1)
    else:
        # Interactive fallback
        try:
            start_row_number = int(input("Enter starting row number (1-based, data rows): ").strip())
        except ValueError:
            print("Invalid input, expected an integer.")
            sys.exit(1)

    if start_row_number < 1:
        print("Starting row must be >= 1.")
        sys.exit(1)

    rows = load_csv_rows(CSV_PATH)
    header = rows[0]
    data_rows = get_data_rows(rows)

    if not data_rows:
        print("No data rows in CSV.")
        sys.exit(1)

    start_index = start_row_number - 1  # convert to 0-based index for data_rows
    end_index = min(start_index + ROWS_TO_PROCESS, len(data_rows))

    if start_index >= len(data_rows):
        print(f"Starting row {start_row_number} is beyond available data rows ({len(data_rows)}).")
        sys.exit(1)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Load build log once (may be None if file not found)
    build_log = load_build_log(BUILD_LOG_PATH)

    # Prepare OpenAI client
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    print(
        f"Processing rows {start_row_number} to "
        f"{start_row_number + (end_index - start_index) - 1} (data rows)."
    )

    # Keep track of which data-row indices are "OK" (no build error)
    successful_row_indices: List[int] = []

    for idx in range(start_index, end_index):
        row_number_human = idx + 1  # still data-row index (1-based)
        row = data_rows[idx]
        print("\n" + "-" * 60)
        print(f"Row {row_number_human}: {row}")

        slug = extract_slug_from_row(row)
        if not slug:
            print("  -> No URL/slug found in this row. Skipping.")
            continue

        print(f"  -> Slug detected: {slug}")

        prompt_file = find_best_prompt_file(slug, PROMPTS_DIR)
        if not prompt_file:
            print(f"  -> No prompt file found for slug '{slug}'. Skipping.")
            continue

        print(f"  -> Using prompt file: {prompt_file}")

        try:
            prompt_json = load_json(prompt_file)
        except Exception as e:
            print(f"  -> ERROR loading JSON from {prompt_file}: {e}")
            continue

        prompt_text = prompt_json.get("prompt")
        if not prompt_text or not isinstance(prompt_text, str):
            print(f"  -> No 'prompt' field found in JSON {prompt_file}. Skipping.")
            continue

        zip_str = find_zip_path_in_json(prompt_json)
        context_files: List[Path] = []

        if zip_str:
            norm = zip_str.strip()

            # ALWAYS convert "../input/xyz.zip" → "./input/xyz/"
            if norm.startswith("../input/"):
                base = norm[len("../input/"):]
            else:
                base = Path(norm).name  # fallback: take only last part

            folder_name = base.replace(".zip", "")  # "xyz.zip" → "xyz"
            folder_path = Path.cwd() / "input" / folder_name

            if folder_path.exists() and folder_path.is_dir():
                print(f"  -> Using folder for context: {folder_path}")
                # Collect all supported files inside folder
                for p in folder_path.rglob("*"):
                    if p.is_file() and p.suffix.lower() in SUPPORTED_CONTEXT_EXTENSIONS:
                        context_files.append(p)
                        print(f"     + Adding context file: {p.name}")
            else:
                print(f"  -> Folder not found: {folder_path}. No context files added.")
        else:
            print("  -> No zip reference found; using prompt only.")



        try:
             raw_output = call_openai_with_prompt_and_context_files(client, prompt_text, context_files)
        except Exception as e:
            print(f"  -> ERROR calling OpenAI for slug '{slug}': {e}")
            continue

        cleaned_json_str = extract_json_block_with_version(raw_output)

        # Validate JSON structure (optional but useful)
        try:
            parsed = json.loads(cleaned_json_str)
        except Exception as e:
            print(f"  -> WARNING: Extracted text is not valid JSON: {e}")
            # Still save raw cleaned string for manual inspection
            output_text_to_save = cleaned_json_str
        else:
            # Re-dump with pretty formatting
            output_text_to_save = json.dumps(parsed, indent=2, ensure_ascii=False)

        output_path = OUTPUT_DIR / f"{slug}.json"
        with output_path.open("w", encoding="utf-8") as f:
            f.write(output_text_to_save)

        print(f"  -> Saved config to {output_path}")

        # If we have a build log, check whether this slug had a build error
        if build_log is not None:
            has_error = slug_has_build_error(build_log, slug)
            if not has_error:
                print("  -> No build error found for this slug in build log. Marking as OK.")
                successful_row_indices.append(idx)
            else:
                print("  -> Build error detected for this slug in build log.")
        else:
            # No build log: we can't mark anything as successfully built
            print("  -> No build log loaded; skipping success marking for this row.")

    # Update calc.csv dates (only for rows without build error)
    if successful_row_indices and build_log is not None:
        today_str = date.today().strftime("%m/%d/%Y")

        print("\nUpdating calc.csv for successful rows with date:", today_str)

        # rows = [header, *data_rows]; data_rows indexes must be shifted by 1
        for idx in successful_row_indices:
            csv_row_index = idx + 1  # +1 because of header
            row = rows[csv_row_index]

            # Ensure the row has at least DATE_COLUMN_INDEX+1 elements
            if len(row) <= DATE_COLUMN_INDEX:
                # Extend with empty strings if needed
                row.extend([""] * (DATE_COLUMN_INDEX + 1 - len(row)))

            row[DATE_COLUMN_INDEX] = today_str
            rows[csv_row_index] = row
            print(f"  -> Row {idx + 1} (data row) updated, column 9 set to {today_str}")

        write_csv_rows(rows, CSV_PATH)
        print("calc.csv updated.")
    else:
        if build_log is None:
            print("\ncalc.csv not updated (no build log available).")
        else:
            print("\nNo successful rows to update in calc.csv based on build log.")

    # After processing, run git commands
    print("\nRunning git add/commit/push ...")
    try:
        run_git_commands(start_row_number)
    except subprocess.CalledProcessError as e:
        print(f"Git command failed: {e}")
        sys.exit(1)

    print("Done.")


if __name__ == "__main__":
    main()
