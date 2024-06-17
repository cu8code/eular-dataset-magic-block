import os
import json
import uuid  # Import uuid library
from datasets import load_dataset

def create_output_directory(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

def get_file_size(filepath):
    return os.path.getsize(filepath)

def save_chunk(chunk, output_dir, chunk_number):
    filename = f"{chunk_number:04d}.json"
    filepath = os.path.join(output_dir, filename)
    
    # Iterate over chunk and add UUID field
    for example in chunk:
        example['uuid'] = str(uuid.uuid4())  # Generate UUID and convert to string

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(chunk, f, ensure_ascii=False, indent=2)
    return get_file_size(filepath)

def chunk_dataset(dataset, output_dir, chunk_size_bytes=1024*1024*4):  # 1MB
    create_output_directory(output_dir)
    current_chunk = []
    current_chunk_size = 0
    chunk_number = 1

    for example in dataset:
        example_json = json.dumps(example)
        example_size = len(example_json.encode('utf-8'))

        if current_chunk_size + example_size > chunk_size_bytes:
            actual_size = save_chunk(current_chunk, output_dir, chunk_number)
            
            if actual_size > chunk_size_bytes:
                os.remove(os.path.join(output_dir, f"{chunk_number:04d}.json"))
                print(f"Deleted oversized chunk {chunk_number:04d}.json")
            else:
                chunk_number += 1

            current_chunk = []
            current_chunk_size = 0

        current_chunk.append(example)
        current_chunk_size += example_size

    if current_chunk:
        actual_size = save_chunk(current_chunk, output_dir, chunk_number)
        if actual_size > chunk_size_bytes:
            os.remove(os.path.join(output_dir, f"{chunk_number:04d}.json"))
            print(f"Deleted oversized chunk {chunk_number:04d}.json")
            chunk_number -= 1

    rename_files(output_dir)

def rename_files(directory):
    files = [f for f in os.listdir(directory) if f.endswith('.json')]
    files.sort()
    for i, filename in enumerate(files, start=1):
        old_file = os.path.join(directory, filename)
        new_file = os.path.join(directory, f"{i:04d}.json")
        os.rename(old_file, new_file)

def main(num_examples=10):
    output_directory = "data"
    
    dataset = load_dataset("BAAI/TACO", split=f"train[:{num_examples}]")
    
    print(f"Loaded {dataset.num_rows} examples from the TACO dataset.")
    chunk_dataset(dataset, output_directory)
    print(f"Dataset has been chunked into JSON files in the '{output_directory}' directory.")

if __name__ == "__main__":
    main(num_examples=500)
