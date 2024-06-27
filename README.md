Here is a revised version of your GitHub README:

# Euler Dataset

This repository contains questions from Project Euler along with their answers. The structure is as follows:

`index.json` contains the metadata such as length, author name, etc.
```typescript
export interface MetaData {
    length: number;
    type: "string";
    name: string;
    author: string;
    description: string;
    email: string;
    twitter?: string;
    github?: string;
    youtube?: string;
    discord?: string;
}
```

The `data` directory contains individual data files named as `id.json`, where `id` corresponds to the Euler question ID. The structure of `id.json` is as follows:
```json
{
  "question": "..",
  "answer": ".."
}
```

If you find any questions with incorrect answers, please make a PR with the corrected solution and an explanation. We will review it!
