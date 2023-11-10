<!--
Delete this section if not a breaking change.
Any breaking changes should have been discussed with a maintainer.
Copy the line between the ⚠️ symbols into the footer of the PR commit to trigger the breaking change release.
See https://www.conventionalcommits.org/en/v1.0.0/#commit-message-with-description-and-breaking-change-footer
-->
⚠️ BREAKING CHANGE: (How and why this is a breaking change.) ⚠️

📷  &nbsp; **Samples**

Add any sample images or videos.

📓  &nbsp; **Related Issue**
If this PR is related to an issue then link it here, or delete this section.

🤔  &nbsp; **What does this PR do?**

- Add bullets..

📑  &nbsp; **How should this be tested?**

Update test steps to match your PR:

```
1. Checkout branch
2. `npm run bootstrap`
3. `npm run test`

Other packages are completely tested via tests from `npm run test`. To test the LSP is working correctly in VSCode:
1. `cd packages/showcase/example`
2. `code .` (or manually open VSCode via the UI to the `example` directory on your filesystem).
3. Open a typescript file such as `root.ts`
4. In the Command Palette choose `TypeScript: select typescript version...` and then choose the workspace version
5. The LSP should be enabled. You will need to make a code change after the LSP is enabled before you see any Intellisense.
```

✅  &nbsp; **Checklist**

<!--- Review the list and put an x in the boxes that apply. -->

- [ ] I have added tests for my changes.
- [ ] I have updated the project documentation.
- [ ] I have followed the [contribution guidelines](https://github.com/genesiscommunitysuccess/custom-elements-lsp/blob/master/CONTRIBUTING.md).
