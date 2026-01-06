(() => {
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    document.addEventListener('DOMContentLoaded', () => {
        const mainLayout = document.getElementById('mainLayout');
        const toggleBtn = document.getElementById('toggleDetailedMode');
        const editor = document.getElementById('detailedEditor');
        const output = document.getElementById('output');
        const canvas = document.getElementById('detailedEditorCanvas');
        if (!toggleBtn || !editor || !output || !canvas) return;

        const imageInput = document.getElementById('detailedImageInput');
        const imageWrapper = document.getElementById('detailedBackgroundImageWrapper');
        const imageEl = document.getElementById('detailedBackgroundImage');
        const imageScaleInput = document.getElementById('detailedImageScale');
        const imageScaleValue = document.getElementById('detailedImageScaleValue');

        const textLayer = document.getElementById('detailedTextLayer');
        const textContent = document.getElementById('detailedTextContent');
        const textScaleInput = document.getElementById('detailedTextScale');
        const textScaleValue = document.getElementById('detailedTextScaleValue');

        const exitBtn = document.getElementById('exitDetailedMode');
        const downloadBtn = document.getElementById('downloadOutputTransparent');

        const fontTrigger = document.getElementById('detailedFontTrigger');
        const fontDropdown = document.getElementById('detailedFontDropdown');
        const fontValue = document.getElementById('detailedFontValue');
        const fontOptions = fontDropdown ? fontDropdown.querySelectorAll('.font-selector-option') : [];

        const outlineInput = document.getElementById('detailedOutlineWidth');
        const outlineValue = document.getElementById('detailedOutlineWidthValue');

        if (!imageInput || !imageWrapper || !imageEl || !imageScaleInput || !imageScaleValue ||
            !textLayer || !textContent || !textScaleInput || !textScaleValue ||
            !exitBtn || !downloadBtn || !outlineInput || !outlineValue) {
            return;
        }

        const state = {
            active: false,
            dragging: null,
            isExporting: false,
            image: {
                scale: parseFloat(imageScaleInput.value) || 1,
                x: 0,
                y: 0,
                hasSource: false
            },
            text: {
                scale: parseFloat(textScaleInput.value) || 1,
                x: 0,
                y: 0
            },
            outline: {
                width: parseFloat(outlineInput.value) || 0
            }
        };

        const applyTransforms = () => {
            imageWrapper.style.left = `${state.image.x}px`;
            imageWrapper.style.top = `${state.image.y}px`;
            imageWrapper.style.transform = `scale(${state.image.scale})`;

            textContent.style.left = `${state.text.x}px`;
            textContent.style.top = `${state.text.y}px`;
            textContent.style.transform = `scale(${state.text.scale})`;
        };

        const applyOutline = () => {
            const width = Math.max(0, state.outline.width);
            outlineValue.textContent = `${width.toFixed(width % 1 === 0 ? 0 : 1)}px`;

            let shadowValue = 'none';
            if (width > 0) {
                const step = Math.max(1, Math.round(width));
                const offsets = [];
                for (let x = -step; x <= step; x++) {
                    for (let y = -step; y <= step; y++) {
                        if (x === 0 && y === 0) continue;
                        offsets.push([x, y]);
                    }
                }
                shadowValue = offsets.map(([x, y]) => `${x}px ${y}px #000`).join(', ');
            }

            const applyToElement = (element) => {
                element.style.textShadow = shadowValue;
                element.style.webkitTextStroke = '0px transparent';
            };

            applyToElement(textContent);
            textContent.querySelectorAll('.generated').forEach(applyToElement);
        };

        const updateScaleLabels = () => {
            imageScaleValue.textContent = `${Math.round(state.image.scale * 100)}%`;
            textScaleValue.textContent = `${Math.round(state.text.scale * 100)}%`;
        };

        const syncTextContent = () => {
            if (!output) return;
            textContent.innerHTML = output.innerHTML;
            const hasText = textContent.textContent.trim().length > 0;
            textLayer.classList.toggle('has-text', hasText);
            applyOutline();
        };

        const observer = new MutationObserver(syncTextContent);
        observer.observe(output, {
            childList: true,
            subtree: true,
            characterData: true
        });
        syncTextContent();

        const setActive = (flag) => {
            state.active = flag;
            toggleBtn.classList.toggle('is-active', flag);
            editor.setAttribute('aria-hidden', String(!flag));
            output.classList.toggle('is-hidden', flag);
            if (mainLayout) {
                mainLayout.classList.toggle('detailed-mode', flag);
            }
            if (flag) {
                syncTextContent();
            }
        };

        const fitImageIntoCanvas = () => {
            const canvasRect = canvas.getBoundingClientRect();
            const scaleX = canvasRect.width / imageEl.naturalWidth;
            const scaleY = canvasRect.height / imageEl.naturalHeight;
            const bestScale = Math.max(scaleX, scaleY);
            state.image.scale = clamp(bestScale, parseFloat(imageScaleInput.min), parseFloat(imageScaleInput.max));
            imageScaleInput.value = state.image.scale;
            state.image.x = 0;
            state.image.y = 0;
            updateScaleLabels();
            applyTransforms();
        };

        const handleImageUpload = (event) => {
            const file = event.target.files && event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                imageEl.onload = () => {
                    state.image.hasSource = true;
                    editor.classList.add('has-background');
                    imageWrapper.style.width = `${imageEl.naturalWidth}px`;
                    imageWrapper.style.height = `${imageEl.naturalHeight}px`;
                    fitImageIntoCanvas();
                };
                imageEl.src = loadEvent.target.result;
            };
            reader.readAsDataURL(file);
            imageInput.value = '';
        };

        const startDrag = (type, target, pointerEvent) => {
            if (!state.active) return;
            if (type === 'image' && !state.image.hasSource) return;

            state.dragging = {
                type,
                pointerId: pointerEvent.pointerId,
                startX: pointerEvent.clientX,
                startY: pointerEvent.clientY,
                originX: state[type].x,
                originY: state[type].y,
                element: target
            };

            target.classList.add('dragging');
            target.setPointerCapture(pointerEvent.pointerId);
        };

        const handlePointerMove = (event) => {
            if (!state.dragging) return;
            if (state.dragging.pointerId !== event.pointerId) return;

            const targetState = state[state.dragging.type];
            targetState.x = state.dragging.originX + (event.clientX - state.dragging.startX);
            targetState.y = state.dragging.originY + (event.clientY - state.dragging.startY);
            applyTransforms();
        };

        const stopDrag = (event) => {
            if (!state.dragging) return;
            if (state.dragging.pointerId !== event.pointerId) return;

            state.dragging.element.classList.remove('dragging');
            state.dragging.element.releasePointerCapture(event.pointerId);
            state.dragging = null;
        };

        const exportDetailedScreenshot = async () => {
            if (state.isExporting) return;
            if (!state.image.hasSource) {
                alert('Загрузите фон, чтобы сохранить изображение.');
                return;
            }

            const width = parseInt(canvas.dataset.width, 10) || canvas.offsetWidth;
            const height = parseInt(canvas.dataset.height, 10) || canvas.offsetHeight;

            state.isExporting = true;
            editor.classList.add('exporting');
            canvas.classList.add('no-outline');

            try {
                const blob = await domtoimage.toBlob(canvas, {
                    width,
                    height,
                    quality: 1,
                    bgcolor: 'transparent',
                    style: {
                        transform: 'none',
                        width: `${width}px`,
                        height: `${height}px`
                    }
                });

                const filename = new Date()
                    .toLocaleString()
                    .replaceAll(/[,: /]/g, '_')
                    .replace(/_+/g, '_') + '_detailed.png';

                window.saveAs(blob, filename);
            } catch (error) {
                console.error('Ошибка при сохранении детального режима:', error);
                alert('Не удалось сохранить изображение: ' + error.message);
            } finally {
                canvas.classList.remove('no-outline');
                editor.classList.remove('exporting');
                state.isExporting = false;
            }
        };

        toggleBtn.addEventListener('click', () => {
            setActive(!state.active);
        });

        exitBtn.addEventListener('click', () => {
            setActive(false);
        });

        imageInput.addEventListener('change', handleImageUpload);
        imageScaleInput.addEventListener('input', (event) => {
            state.image.scale = clamp(parseFloat(event.target.value) || 1, parseFloat(imageScaleInput.min), parseFloat(imageScaleInput.max));
            updateScaleLabels();
            applyTransforms();
        });

        textScaleInput.addEventListener('input', (event) => {
            state.text.scale = clamp(parseFloat(event.target.value) || 1, parseFloat(textScaleInput.min), parseFloat(textScaleInput.max));
            updateScaleLabels();
            applyTransforms();
        });

        outlineInput.addEventListener('input', (event) => {
            state.outline.width = clamp(parseFloat(event.target.value) || 0, parseFloat(outlineInput.min), parseFloat(outlineInput.max));
            applyOutline();
        });

        imageWrapper.addEventListener('pointerdown', (event) => {
            startDrag('image', imageWrapper, event);
        });

        textContent.addEventListener('pointerdown', (event) => {
            startDrag('text', textContent, event);
        });

        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', stopDrag);
        document.addEventListener('pointercancel', stopDrag);

        downloadBtn.addEventListener('click', (event) => {
            if (!state.active) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            exportDetailedScreenshot();
        }, true);

        if (fontTrigger && fontDropdown && fontValue) {
            fontTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = fontDropdown.classList.contains('show');
                document.querySelectorAll('.font-selector-dropdown').forEach(d => d.classList.remove('show'));
                document.querySelectorAll('.font-selector-trigger').forEach(t => t.classList.remove('active'));
                if (!isOpen) {
                    fontDropdown.classList.add('show');
                    fontTrigger.classList.add('active');
                }
            });

            fontOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const selectedFont = option.dataset.font;
                    fontValue.textContent = selectedFont;
                    fontOptions.forEach(o => o.classList.remove('selected'));
                    option.classList.add('selected');
                    textContent.style.fontFamily = selectedFont;
                    fontDropdown.classList.remove('show');
                    fontTrigger.classList.remove('active');
                });
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.detailed-font-selector')) {
                    fontDropdown.classList.remove('show');
                    fontTrigger.classList.remove('active');
                }
            });
        }

        updateScaleLabels();
        applyOutline();
        applyTransforms();
    });
})();
