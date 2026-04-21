---
name: plan
description: Planning workflow for non-trivial features — research, break into steps, write plan, pause for feedback
argument-hint: '[feature-name]'
---

# Planning Workflow

For non-trivial features, follow this process before coding:

1. **Research**: Read existing patterns, affected files, relevant docs
2. **Break into steps**: Simple features → 1 commit; complex → multiple commits, each testable
3. **Write plan** to `plans/$ARGUMENTS/plan.md`:
   - Branch name, description, goal
   - Steps with: files affected, what changes, how to verify
4. **Pause for feedback** before implementing
5. **Implement exactly** what's in the plan — do not deviate
6. **Check off steps** as completed; stop at each `STOP & COMMIT` point
