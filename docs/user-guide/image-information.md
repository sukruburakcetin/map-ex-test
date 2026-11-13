# Image info

Select a Mapillary image, open **Tools & details**, then expand **Image info**. It appears directly below **Coordinates**. Pause playback to load additional details. Nothing needs to be configured.

The section shows capture date and time in UTC, contributor, organization, camera make and model, projection, original image dimensions and megapixels, and capture method. The image ID appears below the details.

- **Original dimensions** describe the uploaded image, not the displayed preview. Hover over the dimensions row for this explanation.
- **Other method** means the image was classified as not captured on foot; it does not identify a vehicle or bicycle.
- **Unknown** means capture method was not classified. **Unavailable** means a field was not supplied.

The details use the panel’s shared scroll area. Scroll, swipe, or focus the scroll area and use arrow keys to reach the lower tools. The width toggle gives long values more room.

The section starts collapsed. It reuses available metadata, and requests missing details only while expanded, visible, and playback is paused. A short settling delay avoids requests while quickly browsing images. Resuming playback or closing the section cancels its pending work. Successful details for up to 16 images stay in memory for reuse while the panel remains mounted.

If loading fails, select **Retry** while paused. Image exploration remains available independently of this optional information.
