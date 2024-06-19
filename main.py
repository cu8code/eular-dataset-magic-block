import os
import json
from datasets import load_dataset

def create_output_directory(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

def get_file_size(filepath):
    return os.path.getsize(filepath)

def save_chunk(chunk, output_dir, chunk_number):
    filename = f"{chunk_number}.json"
    filepath = os.path.join(output_dir, filename)

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(chunk, f, ensure_ascii=False, indent=2)
    return get_file_size(filepath)

def chunk_dataset(dataset, output_dir, chunk_size_bytes=1024*1024*4):  # 1MB
    create_output_directory(output_dir)
    current_chunk = []
    current_chunk_size = 0
    chunk_number = 0  # Start from zero

    for example in dataset:
        example_json = json.dumps(example)
        example_size = len(example_json.encode('utf-8'))

        if current_chunk_size + example_size > chunk_size_bytes:
            actual_size = save_chunk(current_chunk, output_dir, chunk_number)

            if actual_size > chunk_size_bytes:
                os.remove(os.path.join(output_dir, f"{chunk_number}.json"))
                print(f"Deleted oversized chunk {chunk_number}.json")
            else:
                chunk_number += 1

            current_chunk = []
            current_chunk_size = 0

        current_chunk.append(example)
        current_chunk_size += example_size

    if current_chunk:
        actual_size = save_chunk(current_chunk, output_dir, chunk_number)
        if actual_size > chunk_size_bytes:
            os.remove(os.path.join(output_dir, f"{chunk_number}.json"))
            print(f"Deleted oversized chunk {chunk_number}.json")
            chunk_number -= 1

    return chunk_number + 1

def generate_index(output_dir, last_chunk, dataset_type):
    parent_dir = os.path.dirname(output_dir)
    index_filename = os.path.join(parent_dir, "index.json")
    index = {
        os.path.basename(output_dir): {
            "length": last_chunk,
            "type": dataset_type
        }
    }
    with open(index_filename, 'w', encoding='utf-8') as f:
        json.dump(index, f, ensure_ascii=False, indent=2)

def main(num_examples=10):
    output_directory = "data"
    dataset_type = "leetcode"

    dataset = load_dataset("BAAI/TACO", split=f"train[:{num_examples}]")

    print(f"Loaded {dataset.num_rows} examples from the TACO dataset.")
    last_chunk = chunk_dataset(dataset, output_directory)
    print(f"Dataset has been chunked into JSON files in the '{output_directory}' directory.")

    generate_index(output_directory, last_chunk, dataset_type)
    print(f"Generated 'index.json' file in the parent directory of '{output_directory}'.")

if __name__ == "__main__":
    main(num_examples=500)