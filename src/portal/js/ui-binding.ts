// UI Bindings allow the separation of the UI/DOM components from the core application logic.
// This is primarily done to enable testing.

export interface IUIBinding {
    SetNavigationCallback(onNavigation: (path: string) => void): void;
    SetupNavigationEvents(onTitleSelected: (title: string) => void): void;
    SelectDefaultNavigationItem(): void;
    SetContentStageTitle(title: string): void;
    SetNavigationFragment(path: string): void;
}

export class UIBinding implements IUIBinding {
    public SetNavigationCallback(onNavigation: (path: string) => void) {
        // This method can be used to wire up any initial event handlers
        $(window).on('hashchange', () => {
            const navTitle = location.hash.replace('#', '');
            onNavigation(navTitle);
            $(`.navigation li[data-action-name="${navTitle}"]`).click();
        });
    }

    public SelectDefaultNavigationItem() {
        $('.navigation li.selected').click();
    }

    public SetupNavigationEvents(onTitleSelected: (title: string) => void) {
        $('.navigation li').on('click', (e: any) => {
            const contentTitle = $(e.target).data('action-name');

            if (onTitleSelected) {
                onTitleSelected(contentTitle);
            }
            $('.navigation li').removeClass('selected');
            $(e.target).addClass('selected');
        });
    }

    public SetContentStageTitle(title: string) {
        $('.content-stage h2').text(title);
    }

    public SetNavigationFragment(path: string) {
        location.hash = path;
    }
}
