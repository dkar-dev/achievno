# Codex execution contracts

This directory contains executable implementation contracts for Codex.

Notion remains the strategic source for product vision, PRD, and high-level decisions. Repository contracts are the executable source for code-generation work.

## Workflow

1. Select one ready contract.
2. Give Codex the YAML contract plus a short instruction:

   ```text
   Execute the attached YAML contract exactly. Do not expand scope. If repository state conflicts with the contract, stop and report the blocker instead of inventing a workaround.
   ```

3. Run the acceptance commands from the contract.
4. Review the diff against the contract.
5. If it fails, create a bounded fix contract instead of broadening the original task.

## Contract rules

- One contract must describe one bounded task.
- A contract may be an infrastructure block or one vertical product slice.
- Contracts must declare allowed files and forbidden changes.
- P0 contracts must include acceptance commands.
- If a P0 flow is claimed, it must work end-to-end.
- If a flow cannot work end-to-end in the current task, it must be declared P1/P2/stub/deferred.

## Naming

Use ordered prefixes:

```text
C0_*  project rules and architecture contracts
A0_*  backend/runtime foundation
A1_*  auth/session foundation
B0_*  frontend/API wiring
P0_*  product vertical slices
U0_*  UI hardening passes
F0_*  fix contracts
```

## Status values

```text
draft
ready_for_codex
in_progress
needs_fix
accepted
deferred
```

## Required Codex output

Every Codex run must return:

- summary
- changed files
- commands run
- known gaps
- blockers, if any
