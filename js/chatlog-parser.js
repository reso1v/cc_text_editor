function useRegex(input) {
    let regex = /([01]\d|2[0-3]):[0-5]\d:[0-5]\d/;
    return regex.test(input);
}

$(document).ready(function() {
    const $textarea = $('.textarea-input');
    const $emptyState = $('#emptyState');
    
    function toggleEmptyState() {
        const hasContent = $textarea.val().trim().length > 0;
        if (hasContent) {
            $emptyState.addClass('hidden');
        } else {
            $emptyState.removeClass('hidden');
        }
    }
    
    $textarea.on('input', function() {
        toggleEmptyState();
        parseAndDisplayChatlog();
    });
    
    $textarea.on('focus', function() {
        if ($textarea.val().trim().length === 0) {
            $emptyState.addClass('hidden');
        }
    });
    
    $textarea.on('blur', function() {
        setTimeout(() => {
            if ($textarea.val().trim().length === 0) {
                $emptyState.removeClass('hidden');
            }
        }, 200);
    });
    
    $emptyState.on('click', function() {
        $textarea.focus();
    });
    
    toggleEmptyState();
    
    function parseAndDisplayChatlog() {
        $(".generated").remove();
        $(".clear").remove();
        
        var lines = $("textarea").val().replace("<script>", "").replace("</script>", "").split("\n");
        
        for (var i = 0; i < lines.length; i++) {
            $(".output").append(
                '<div class="generated" id="chatlogOutput">' +
                (useRegex(lines[i]) ? lines[i].slice(10) : lines[i].slice(0)) +
                '</div><div class="clear"></div>'
            );
        }

        $(".generated").each(function() {
            var lines = $(this).text().split('\n');
            var formattedLines = [];

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];

                function replaceColorCodes(str) {
                    let result = str;
                    
                    function applyInlineHexColors(input) {
                        const segments = input.split(/(\{[A-Fa-f0-9]{6}\})/g);
                        let html = '';
                        let hasOpenSpan = false;
                        
                        segments.forEach(segment => {
                            const match = segment.match(/^\{([A-Fa-f0-9]{6})\}$/);
                            if (match) {
                                if (hasOpenSpan) {
                                    html += '</span>';
                                }
                                hasOpenSpan = true;
                                html += `<span style="color: #${match[1]};">`;
                            } else {
                                html += segment;
                            }
                        });
                        
                        if (hasOpenSpan) {
                            html += '</span>';
                        }
                        
                        return html;
                    }
                    
                    if (result.includes("<П>")) {
                        result = result.replace(/<П>/g, '<br>');
                    }
                    
                    if (result.includes("[!]")) {
                        result = result.replace(/\[!\]/g, '<span style="color: #F200BA;">[!]</span>');
                    }
                    
                    if (result.includes("Мы разместили отметку на вашей карте чтобы помочь вам определить местонахождение вашего автомобиля")) {
                        result = result.replace(/отметку/, '<span style="color: #F9F900;">отметку</span>');
                    }
                    
                    if (result.includes("Вы не имеете доступа к этой команде")) {
                        return '<span style="color: #FF0000;">' + result + '</span>';
                    }

                    if (result.toLowerCase().includes("репорт был принят командой администрации сервера")) {
                        return '<span style="color: #FF0000;">' + result + '</span>';
                    }

                    if (result.trim().startsWith('*')) {
                        return '<span style="color: #8966A5;">' + result + '</span>';
                    }

                    result = result.replace(/\*(.*?)\*/g, '<span style="color: #8966A5;">*$1*</span>');
                    
                    result = result.replace(/\/\S+/g, function(match) {
                        if (match.includes('span>')) return match;
                        return '<span style="color: #1F92FE;">' + match + '</span>';
                    });
                    
                    result = result.replace(/\/(?=\s|$)/g, '<span style="color: #1F92FE;">/</span>');
                    
                    result = result.replace(/\\n/g, '<br class="inline-break" />');
                    
                    result = applyInlineHexColors(result);
                    
                    return result;
                }

                line = replaceColorCodes(line);
                formattedLines.push(line);
            }

            var formattedText = formattedLines.join('<br>');

            if (navigator.userAgent.indexOf("Chrome") != -1) {
                $(this).append(" ");
            }

            if (formattedText.toLowerCase().indexOf("репорт находится в процессе рассмотрения") >= 0) {
                $(this).css("color", "#FF0000");
            }
            if (formattedText.trim().startsWith("((") && formattedText.trim().endsWith("))")) {
                $(this).css("color", "#616161");
            }
            if (formattedText.toLowerCase().indexOf("говорит (к") >= 0) {
                $(this).css("color", "#ACACAE");
            }
            if (formattedText.toLowerCase().indexOf("(транспорт)") >= 0) {
                $(this).css("color", "#F9F900");
            }
            if (formattedText.toLowerCase().indexOf("шепчет:") >= 0) {
                $(this).css("color", "#E7A820");
            }

            if (formattedText.toLowerCase().indexOf(" says:") >= 0) $(this).addClass("white");
            if (formattedText.toLowerCase().indexOf(" [low]:") >= 0) $(this).addClass("grey");
            if (formattedText.toLowerCase().indexOf(", $") >= 0) $(this).addClass("grey");
            if (formattedText.toLowerCase().indexOf("you have received $") >= 0) $(this).addClass("grey");
            if (formattedText.toLowerCase().indexOf(" whispers:") >= 0) $(this).addClass("whisper");
            if (formattedText.toLowerCase().indexOf(" whispers:") >= 0 && formattedText.toLowerCase().indexOf("(car)") >= 0) $(this).addClass("carwhisper");
            if (formattedText.toLowerCase().indexOf(" (phone)") >= 0) $(this).addClass("whisper");
            if (formattedText.toLowerCase().indexOf(":o<") >= 0) $(this).addClass("whisper");
            if (formattedText.toLowerCase().indexOf(" [san interview]") == 0) $(this).addClass("news");
            if (formattedText.toLowerCase().indexOf("[san interview]") == 0) $(this).addClass("news");
            if (formattedText.toLowerCase().indexOf(" **[ch:") == 0) $(this).addClass("radio");
            if (formattedText.toLowerCase().indexOf("**[ch:") == 0) $(this).addClass("radio");
            if (formattedText.toLowerCase().startsWith(" ** [") && formattedText.toLowerCase().includes("]") && /\[.*?\]/.test(formattedText)) $(this).addClass("dep");
            if (formattedText.toLowerCase().startsWith("** [") && formattedText.toLowerCase().includes("]") && /\[.*?\]/.test(formattedText)) $(this).addClass("dep");
            if (formattedText.startsWith("`")) {
                $(this).addClass("quote-line");
                formattedText = formattedText.substring(1);
            }

            $(this).html(formattedText);

            $(this).textContent += "‎  ";
            if (!formattedText) $(this).remove();
        });

        $(".generated:first").css({
            "margin-top": "30px",
            "padding-top": "10px"
        });
        
        $(".generated:last").css({
            "padding-bottom": "10px",
            "margin-bottom": "30px"
        });

        $(".generated").css("background-color", "transparent");
    }

    var charName = $("#name").val().toLowerCase();
    var lastCharName = $.jStorage.get("lastCharName");
    
    if (!lastCharName) {
        $.jStorage.set("lastCharName", "");
    }
    
    $("#name").val($.jStorage.get("lastCharName"));
    
    $("#name").on("input propertychange", function() {
        charName = $("#name").val().toLowerCase();
        $.jStorage.set("lastCharName", charName);
        parseAndDisplayChatlog();
    });

    var lastFontSize = $.jStorage.get("lastFontSize");
    var lastLineHeight = $.jStorage.get("lastLineHeight");

    if (!lastFontSize || !lastLineHeight) {
        $.jStorage.set("lastFontSize", "12");
        $.jStorage.set("lastLineHeight", "2");
    }

    $(".output").css({
        "font-size": lastFontSize + "px",
        "line-height": lastLineHeight,
    });

    $("#font-label").text("font size (" + lastFontSize + "px):");

    const lineHeightSlider = document.getElementById('line-height');
    const lineHeightValue = document.querySelector('.line-height-value');

    const savedLineHeight = $.jStorage.get("lastLineHeight");
    if (savedLineHeight) {
        lineHeightSlider.value = savedLineHeight;
        lineHeightValue.textContent = savedLineHeight;
    }
});