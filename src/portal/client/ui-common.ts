// Common methods for use across the various UI bindings / components
export class UiCommon {
    // Formates a given duration (given in millis) to a fractional number of minutes
    // Typically used for compact display in data grids / etc.
    public static FormatDurationInMs(durationInMs: number) {
        const mins = durationInMs / (60 * 1000);
        return `${mins.toFixed(2)} mins`;
    }
}
