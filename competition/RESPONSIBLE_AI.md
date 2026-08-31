# Responsible-AI Statement

## Decision boundary

AluSathi may help a farmer collect evidence and understand uncertainty. It must not diagnose with certainty, prescribe chemicals or replace an agricultural expert.

## Human control

- Farmers choose whether to photograph, retake, save locally or call for help.
- The interface says when the model is uncertain.
- Agriculture Call Centre 16123 is available beside results.
- Chemical decisions are always escalated to a qualified human.

## Uncertainty and failure

- Dark, bright and low-contrast images are explained in simple language.
- Low confidence and close competing predictions are rejected.
- Uncertain photos do not advance the five-location field check.
- The current model is locked because external regional performance is inadequate.
- The interface does not display raw confidence while field validation is pending.

## Privacy

- No account is required for the active farmer flow.
- Scan history is stored in the browser on the farmer's device.
- Offline images remain in IndexedDB until successfully processed.
- Uploaded images are processed in memory and are not silently added to training data.
- Future dataset contribution requires informed consent and separate governance.

## Inclusion

- Bangla is the default language.
- Instructions use short sentences and large touch targets.
- Voice playback supports farmers who prefer listening.
- Offline recovery addresses unreliable rural connectivity.
- The five-location workflow reduces dependence on one potentially misleading leaf.

## Accountability

The team owns model evaluation, documentation, incident response and correction of harmful guidance. Dataset provenance, model limitations and test results are published with the repository. The release status must change only after a documented review, not merely because a demo looks convincing.
