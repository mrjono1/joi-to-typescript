---
name: Bug report
about: Create a report to help us improve
title: ''
labels: ''
assignees: ''

---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
```TypeScript
import Joi from "joi";
export const JobSchema = Joi.object({
  businessName: Joi.string().required(),
  jobTitle: Joi.string().required()
}).meta({ className: 'Job' });
```

**Expected behavior**
A clear and concise description of what you expected to happen.
```TypeScript
export interface Job {
  businessName: string;
  jobTitle: string;
}
```

**Actual behavior**
A clear and concise description of what actually to happened.
```TypeScript
export interface Job {}
```

**Additional context**
Add any other context about the problem here.
