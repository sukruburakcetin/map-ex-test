# Time travel preview and comparison

Use **Time travel** on the current image to review captures from other dates. The action appears when the experience enables it and the current capture has eligible nearby imagery.

1. Choose a date under **Related capture**.
2. Select **Compare with current image**, then move the slider to reveal either side. The slider also works with the arrow keys.
3. To compare two alternative captures, choose the desired alternative and use **Use [date] as starting image**. Choose the other image under **Compare it to**.
4. Use the fullscreen icon to expand the comparison. The selected captures and slider position carry through the transition. **Explore on Mapillary** opens the external Time Travel view.

## Browse the timeline

Choose **Timeline** to browse the current capture and eligible dated alternatives from oldest to newest. Drag the slider, use the arrow keys, or select a date below the preview. On small screens, swipe the date strip to see more dates.

Timeline uses the same nearby preview images as Comparison. Switch back to **Comparison** to resume the same pair and slider position.

## Share or record a comparison

- **Copy comparison link** preserves both capture IDs and the slider position. Use the link from a published experience for recipients who lack draft access. Recipients need access to the experience and imagery.
- **Add to workspace note** seeds a draft with the capture location, dates, and comparison. Add your observation and select a category before publishing. If the action is unavailable, check that sharing is enabled and the current capture has a location.
- From a [workspace note](workspaces.md), choose **Open comparison**. Use **Back to note** to return to the workspace or **Open in new tab** for side-by-side review.

!!! note "How to interpret the preview"
    Time Travel compares static thumbnails. Different capture positions, directions, and panorama projections can affect alignment. The nearby picker uses a bounded result set.

## Candidate and loading behavior

The nearby query retains the 12-metre radius, one-day minimum gap, different-sequence requirement, and 22.5-degree heading limit with a panorama exception. The picker can show up to 12 alternatives from a bounded lookup of up to three 50-candidate pages, newest first.

Opening the normal preview starts abortable metadata requests unless a recent result exists. Opening a shared comparison requests the saved capture IDs directly. Closing the dialog or changing the active image cancels pending preview work. Reopening the same capture reuses recent results for two minutes, or ten seconds if no alternatives were found.

For code changes, follow the host build and live imagery checks in [contributing](../../CONTRIBUTING.md).
