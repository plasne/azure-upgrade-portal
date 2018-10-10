"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UIBinding {
    SelectDefaultNavigationItem() {
        $('.navigation li.selected').click();
    }
    SetupNavigationEvents() {
        $('.navigation li').on('click', (e) => {
            const sampleContent = `{${$(e.target).data('action-name')}}`;
            $('.content-stage h2').text(sampleContent);
            $('.navigation li').removeClass('selected');
            $(e.target).addClass('selected');
        });
    }
}
exports.UIBinding = UIBinding;
