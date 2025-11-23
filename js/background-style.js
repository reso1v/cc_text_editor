$(document).ready(function() {
    const styles = ['none', 'dark', 'blue', 'green', 'red', 'purple'];
    let currentStyleIndex = 0;

    const storedStyle = $.jStorage.get("backgroundStyle") || 'none';
    currentStyleIndex = styles.indexOf(storedStyle);

    function updateBackgroundStyle(style) {
        const $output = $('.output');
        $output.removeClass('style-dark style-blue style-green style-red style-purple');
        
        if (style !== 'none') {
            $output.addClass(`style-${style}`);
            $output.css({
                'background': 'transparent',
                'border': '2px dashed rgba(255, 255, 255, 0.3)'
            });
        } else {
            $output.css({
                'background': '#1e1e1e',
                'border': 'none'
            });
        }

        const styleNames = {
            'none': 'Без фона',
            'dark': 'Темный',
            'blue': 'Синий',
            'green': 'Зеленый',
            'red': 'Красный',
            'purple': 'Фиолетовый'
        };
        
        $('#backgroundButton').text(`Фон: ${styleNames[style]}`);
        $.jStorage.set("backgroundStyle", style);
    }

    $('#prevBackground').on('click', function() {
        currentStyleIndex = (currentStyleIndex - 1 + styles.length) % styles.length;
        updateBackgroundStyle(styles[currentStyleIndex]);
    });

    $('#nextBackground').on('click', function() {
        currentStyleIndex = (currentStyleIndex + 1) % styles.length;
        updateBackgroundStyle(styles[currentStyleIndex]);
    });

    updateBackgroundStyle(styles[currentStyleIndex]);

    $("#downloadOutputTransparent").click(function() {
        const $output = $('.output');
        const originalClasses = $output.attr('class');
        const originalStyles = {
            background: $output.css('background'),
            border: $output.css('border')
        };

        $output.css({
            'background': '#1e1e1e',
            'border': 'none'
        });

        const options = {
            quality: 1,
            pixelRatio: window.devicePixelRatio || 1,
            bgcolor: '#1e1e1e'
        };

        domtoimage.toBlob(document.getElementById('output'), options)
            .then(function(blob) {
                const filename = new Date()
                    .toLocaleString()
                    .replaceAll(/[,: /]/g, '_')
                    .replace(/_+/g, '_') + '_chatlog.png';
                    
                window.saveAs(blob, filename);

                $output.attr('class', originalClasses);
                $output.css(originalStyles);
            })
            .catch(function(error) {
                console.error('Error:', error);
                alert('Ошибка при сохранении: ' + error.message);

                $output.attr('class', originalClasses);
                $output.css(originalStyles);
            });
    });
});
