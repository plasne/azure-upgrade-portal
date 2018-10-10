export interface IUIBinding {
    SetupNavigationEvents(): void;
    SelectDefaultNavigationItem(): void;
    // DisplaySummaryInformation(): void;
}

export class UIBinding implements IUIBinding {
    public SelectDefaultNavigationItem() {
        $('.navigation li.selected').click();
    }

    public SetupNavigationEvents() {
        $('.navigation li').on('click', (e: any) => {
            const sampleContent = `{${$(e.target).data('action-name')}}`;

            $('.content-stage h2').text(sampleContent);
            $('.navigation li').removeClass('selected');
            $(e.target).addClass('selected');
        });
    }

    // public DisplaySummaryInformation() {
    //     $('body');
    // }
}
