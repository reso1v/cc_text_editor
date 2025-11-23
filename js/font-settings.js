$(document).ready(function() {
    var storedFontSize = $.jStorage.get("lastFontSize") || "12";
    var storedLineHeight = $.jStorage.get("lastLineHeight") || "1.2";
    var storedFontFamily = $.jStorage.get("lastFontFamily") || "Arial";

    $(".output").css({
        "font-size": storedFontSize + "px",
        "line-height": storedLineHeight,
        "font-family": storedFontFamily
    });

    $("#font-label").val(storedFontSize);
    $("#line-height").val(storedLineHeight);
    $("#font-family").val(storedFontFamily);
    $("#fontSelectorValue").text(storedFontFamily);

    $("#font-label").on("input", function() {
        var newSize = parseInt($(this).val());
        if (newSize >= 10 && newSize <= 64) {
            $(".output").css("font-size", newSize + "px");
            $.jStorage.set("lastFontSize", newSize);
        }
    });

    $("#line-height").on("input", function() {
        var newLineHeight = parseFloat($(this).val());
        if (newLineHeight >= -6 && newLineHeight <= 3) {
            $(".output").css("line-height", newLineHeight);
            $.jStorage.set("lastLineHeight", newLineHeight);
            $('.line-height-value').text(newLineHeight);
        }
    });

    const $trigger = $('#fontSelectorTrigger');
    const $dropdown = $('#fontSelectorDropdown');
    const $value = $('#fontSelectorValue');
    const $hiddenInput = $('#font-family');
    const $options = $('.font-selector-option');

    $trigger.on('click', function(e) {
        e.stopPropagation();
        const isOpen = $dropdown.hasClass('show');
        
        $('.font-selector-dropdown').removeClass('show');
        $('.font-selector-trigger').removeClass('active');
        
        if (!isOpen) {
            $dropdown.addClass('show');
            $trigger.addClass('active');
        }
    });

    $options.on('click', function(e) {
        e.stopPropagation();
        const $option = $(this);
        const selectedFont = $option.data('font');
        
        $value.text(selectedFont);
        $hiddenInput.val(selectedFont);
        
        $options.removeClass('selected');
        $option.addClass('selected');
        
        $(".output").css("font-family", selectedFont);
        $.jStorage.set("lastFontFamily", selectedFont);
        
        $dropdown.removeClass('show');
        $trigger.removeClass('active');
    });

    $(document).on('click', function(e) {
        if (!$(e.target).closest('.font-selector').length) {
            $dropdown.removeClass('show');
            $trigger.removeClass('active');
        }
    });

    $options.removeClass('selected');
    $options.filter(`[data-font="${storedFontFamily}"]`).addClass('selected');

    function initCustomScrollbar() {
        let isScrolling = false;
        let startY = 0;
        let scrollTop = 0;

        $dropdown.on('touchstart', function(e) {
            isScrolling = true;
            startY = e.originalEvent.touches[0].pageY;
            scrollTop = $dropdown.scrollTop();
        });

        $dropdown.on('touchmove', function(e) {
            if (!isScrolling) return;
            
            const currentY = e.originalEvent.touches[0].pageY;
            const walk = (startY - currentY) * 2;
            $dropdown.scrollTop(scrollTop + walk);
        });

        $dropdown.on('touchend', function() {
            isScrolling = false;
        });

        $trigger.on('click', function() {
            setTimeout(function() {
                const $selected = $dropdown.find('.selected');
                if ($selected.length) {
                    const optionTop = $selected.position().top;
                    const dropdownHeight = $dropdown.height();
                    const optionHeight = $selected.outerHeight();
                    
                    if (optionTop < 0 || optionTop + optionHeight > dropdownHeight) {
                        $dropdown.scrollTop(optionTop - (dropdownHeight / 2) + (optionHeight / 2));
                    }
                }
            }, 100);
        });
    }

    initCustomScrollbar();

    $('#guideButton').on('click', function(e) {
        e.preventDefault();
        $('#guideModal').addClass('show');
        $('body').css('overflow', 'hidden');
    });

    $('#closeModal').on('click', function() {
        $('#guideModal').removeClass('show');
        $('body').css('overflow', '');
    });

    $('#guideModal').on('click', function(e) {
        if (e.target === this) {
            $(this).removeClass('show');
            $('body').css('overflow', '');
        }
    });

    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && $('#guideModal').hasClass('show')) {
            $('#guideModal').removeClass('show');
            $guideModal.removeClass('show');
            $('body').css('overflow', '');
        }
    });
});
