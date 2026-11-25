# Security policy

## Supported versions

Only the latest tagged release of a skill receives security fixes. Skills are instructions, not a hosted service, so there is no separate patch branch.

## Reporting a vulnerability

Do not open a public issue. Use GitHub private vulnerability reporting:

<https://github.com/preskater/skills/security/advisories/new>

Include:

- The skill name and version, or the installer or validator version
- The harness you used
- The file or prompt involved
- The impact, including what an agent could be tricked into doing
- Reproduction steps

## What is in scope

- Threats to users of this repository, whether or not the underlying model behaves as instructed
- Prompt injection or instructions that cause data exfiltration, credential leakage, or destructive commands
- Skills that bypass review, verification, or approval gates
- Unsafe `allowed-tools` grants, symlinks, or installer path handling
- Arbitrary write, path traversal, or privilege escalation in `scripts/`
- Secrets, tokens, or internal hostnames committed to the repository

## What is out of scope

- Model behavior unrelated to the instructions in this repository
- Vulnerabilities in Claude Code, Codex, OpenCode, or other harnesses; report those upstream
- Social engineering that does not involve this repository
- Findings that require an already-compromised machine

## Response

We acknowledge reports within three business days and aim to triage within ten. We will credit reporters in the advisory unless asked otherwise.

Please give us a reasonable window to ship a fix before public disclosure.
