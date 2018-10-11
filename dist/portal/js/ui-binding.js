"use strict";
// UI Bindings allow the separation of the UI/DOM components from the core application logic.
// This is primarily done to enable testing.
Object.defineProperty(exports, "__esModule", { value: true });
class UIBinding {
    SetNavigationCallback(onNavigation) {
        // This method can be used to wire up any initial event handlers
        $(window).on('hashchange', () => {
            const navTitle = location.hash.replace('#', '');
            onNavigation(navTitle);
            $(`.navigation li[data-action-name="${navTitle}"]`).click();
        });
    }
    SelectDefaultNavigationItem() {
        $('.navigation li.selected').click();
    }
    SetupNavigationEvents(onTitleSelected) {
        $('.navigation li').on('click', (e) => {
            const contentTitle = $(e.target).data('action-name');
            if (onTitleSelected) {
                onTitleSelected(contentTitle);
            }
            $('.navigation li').removeClass('selected');
            $(e.target).addClass('selected');
        });
    }
    SetContentStageTitle(title) {
        $('.content-stage h2').text(title);
    }
    SetNavigationFragment(path) {
        location.hash = path;
    }
}
exports.UIBinding = UIBinding;
