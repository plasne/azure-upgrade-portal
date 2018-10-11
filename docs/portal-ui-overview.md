# Portal UI Overview

The UI for the Azure Upgrade Portal is broken out into the following architecture:

![portal-ui-structure](portal-ui-structure.png)

Based on this layout, note this split between core logic and the UI-specific code. This was done in order to keep the UI event logic and DOM manipulation out of the core orchestration logic to enable testing.

Currently, all UI/DOM specific code is in the `ui-bindings.ts` file, which also defines an interface that any implementations of the UI must implement. This interface is used in the test harnesses to provide a virtualized view of the UI without having to run an im-memory DOM
