# Collaboration workspace documentation

The educator-specific prototype is now generalized for teams, communities and organizations. See [Collaboration workspaces](COLLABORATION-WORKSPACES.md) for the current architecture and [operator setup](../tools/community-notes/README.md).

Existing installations should apply `apply-collaboration-workspace-terms.cjs`. Operators with an existing backend then run `tools/community-notes/migrations/002-collaboration-creator.sql`; fresh backends use the current `schema.sql`. No backend migration is executed by the widget installer.
