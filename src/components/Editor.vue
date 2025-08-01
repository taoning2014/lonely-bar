<template>
    <div class="editor">
        <div class="canvas" @dblclick="dblclick">
            <img ref="image" :alt="data.name" :src="data.url" @loadstart="start" @load="start">
        </div>
        <div v-if="cropper" class="toolbar" @click="click">
            <button class="toolbar__button" data-action="move" title="Move (M)">
                <span class="fa fa-arrows" />
            </button>
            <button class="toolbar__button" data-action="crop" title="Crop (C)">
                <span class="fa fa-crop" />
            </button>
            <button class="toolbar__button" data-action="zoom-in" title="Zoom In (I)">
                <span class="fa fa-search-plus" />
            </button>
            <button class="toolbar__button" data-action="zoom-out" title="Zoom Out (O)">
                <span class="fa fa-search-minus" />
            </button>
            <button class="toolbar__button" data-action="rotate-left" title="Rotate Left (L)">
                <span class="fa fa-rotate-left" />
            </button>
            <button class="toolbar__button" data-action="rotate-right" title="Rotate Right (R)">
                <span class="fa fa-rotate-right" />
            </button>
            <button class="toolbar__button" data-action="flip-horizontal" title="Flip Horizontal (H)">
                <span class="fa fa-arrows-h" />
            </button>
            <button class="toolbar__button" data-action="flip-vertical" title="Flip Vertical (V)">
                <span class="fa fa-arrows-v" />
            </button>
            <button class="toolbar__button" 
                :class="{ 'toolbar__button--disabled': isRemovingHorizontalSeam || isRemovingVerticalSeam }"
                data-action="remove-horizontal-seam"
                title="Remove Horizontal Seam (Ctrl+H)"
                :disabled="isRemovingHorizontalSeam || isRemovingVerticalSeam">
                <span v-if="isRemovingHorizontalSeam" class="fa fa-spinner fa-spin" />
                <span v-else class="fa fa-magic" />
            </button>
            <button class="toolbar__button" 
                :class="{ 'toolbar__button--disabled': isRemovingVerticalSeam || isRemovingHorizontalSeam }"
                data-action="remove-vertical-seam" 
                title="Remove Vertical Seam (Ctrl+V)"
                :disabled="isRemovingVerticalSeam || isRemovingHorizontalSeam">
                <span v-if="isRemovingVerticalSeam" class="fa fa-spinner fa-spin" />
                <span v-else class="fa fa-magnet" />
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import Cropper from 'cropperjs';
import type { ImageData } from '../types/index';
import { removeHorizontalSeam, removeVerticalSeam } from '../utils';

interface EditorData {
    canvasData: Cropper.CanvasData | null;
    cropBoxData: Cropper.CropBoxData | null;
    croppedData: Cropper.Data | null;
    cropper: Cropper | null;
    onKeydown?: (e: KeyboardEvent) => void;
    isRemovingHorizontalSeam: boolean;
    isRemovingVerticalSeam: boolean;
}

export default {
    props: {
        data: {
            type: Object as () => ImageData,
            default: () => ({
                cropped: false,
                cropping: false,
                loaded: false,
                name: '',
                previousUrl: '',
                type: '',
                url: '',
            }),
        },
    },

    data(): EditorData {
        return {
            canvasData: null,
            cropBoxData: null,
            croppedData: null,
            cropper: null,
            isRemovingHorizontalSeam: false,
            isRemovingVerticalSeam: false,
        };
    },

    mounted() {
        this.onKeydown = this.keydown.bind(this);
        window.addEventListener('keydown', this.onKeydown);
    },

    beforeDestroy() {
        if (this.onKeydown) {
            window.removeEventListener('keydown', this.onKeydown);
        }
        this.stop();
    },

    methods: {
        click(event: MouseEvent) {
            const target = event.target as HTMLElement;
            if (!target) {
                return;
            }

            const { cropper } = this;
            if (!cropper) {
                return;
            }

            const action = target.getAttribute('data-action') || target.parentElement?.getAttribute('data-action');

            switch (action) {
                case 'move':
                case 'crop':
                    cropper.setDragMode(action);
                    break;

                case 'zoom-in':
                    cropper.zoom(0.1);
                    break;

                case 'zoom-out':
                    cropper.zoom(-0.1);
                    break;

                case 'rotate-left':
                    cropper.rotate(-90);
                    break;

                case 'rotate-right':
                    cropper.rotate(90);
                    break;

                case 'flip-horizontal':
                    cropper.scaleX(-cropper.getData().scaleX || -1);
                    break;

                case 'flip-vertical':
                    cropper.scaleY(-cropper.getData().scaleY || -1);
                    break;
                case 'remove-horizontal-seam':
                    if (!this.isRemovingHorizontalSeam && !this.isRemovingVerticalSeam) {
                        this.handleRemoveHorizontalSeam(cropper);
                    }
                    break;
                case 'remove-vertical-seam':
                    if (!this.isRemovingVerticalSeam && !this.isRemovingHorizontalSeam) {
                        this.handleRemoveVerticalSeam(cropper);
                    }
                    break;

                default:
            }
        },

        keydown(e: KeyboardEvent) {
            switch (e.key) {
                // Undo crop
                case 'z':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.restore();
                    }

                    break;

                // Delete the image
                case 'Delete':
                    this.reset();
                    break;

                default:
            }

            const { cropper } = this;

            if (!cropper) {
                return;
            }

            switch (e.key) {
                // Crop the image
                case 'Enter':
                    this.crop();
                    break;

                // Clear crop area
                case 'Escape':
                    this.clear();
                    break;

                // Move to the left
                case 'ArrowLeft':
                    e.preventDefault();
                    cropper.move(-1, 0);
                    break;

                // Move to the top
                case 'ArrowUp':
                    e.preventDefault();
                    cropper.move(0, -1);
                    break;

                // Move to the right
                case 'ArrowRight':
                    e.preventDefault();
                    cropper.move(1, 0);
                    break;

                // Move to the bottom
                case 'ArrowDown':
                    e.preventDefault();
                    cropper.move(0, 1);
                    break;

                // Enter crop mode
                case 'c':
                    cropper.setDragMode('crop');
                    break;

                // Enter move mode
                case 'm':
                    cropper.setDragMode('move');
                    break;

                // Zoom in
                case 'i':
                    cropper.zoom(0.1);
                    break;

                // Zoom out
                case 'o':
                    cropper.zoom(-0.1);
                    break;

                // Rotate left
                case 'l':
                    cropper.rotate(-90);
                    break;

                // Rotate right
                case 'r':
                    cropper.rotate(90);
                    break;

                case 'h':
                    if (e.ctrlKey) {
                        // Remove horizontal seam
                        e.preventDefault();
                        if (!this.isRemovingHorizontalSeam && !this.isRemovingVerticalSeam) {
                            this.handleRemoveHorizontalSeam(cropper);
                        }
                    } else {
                        // Flip horizontal
                        cropper.scaleX(-cropper.getData().scaleX || -1);
                    }
                    break;

                case 'v':
                    if (e.ctrlKey) {
                        // Remove vertical seam
                        e.preventDefault();
                        if (!this.isRemovingVerticalSeam && !this.isRemovingHorizontalSeam) {
                            this.handleRemoveVerticalSeam(cropper);
                        }
                    } else {
                        // Flip vertical
                        cropper.scaleY(-cropper.getData().scaleY || -1);
                    }
                    break;


                default:
            }
        },

        dblclick(e: MouseEvent) {
            const target = e.target as HTMLElement;
            if (target && target.className.indexOf('cropper-face') >= 0) {
                e.preventDefault();
                e.stopPropagation();
                this.crop();
            }
        },

        start() {
            const { data } = this;

            if (data.cropped || this.cropper) {
                return;
            }

            const imageRef = this.$refs.image as HTMLImageElement;
            if (!imageRef) {
                return;
            }

            this.cropper = new Cropper(imageRef, {
                autoCrop: false,
                dragMode: 'move',
                background: false,

                ready: () => {
                    if (this.croppedData && this.cropper && this.canvasData && this.cropBoxData) {
                        this.cropper
                            .crop()
                            .setData(this.croppedData)
                            .setCanvasData(this.canvasData)
                            .setCropBoxData(this.cropBoxData);

                        this.croppedData = null;
                        this.canvasData = null;
                        this.cropBoxData = null;
                    }
                },

                crop: ({ detail }: Cropper.CropEvent) => {
                    if (detail.width > 0 && detail.height > 0 && !data.cropping) {
                        this.update({
                            cropping: true,
                        });
                    }
                },
            });
        },

        stop() {
            if (this.cropper) {
                this.cropper.destroy();
                this.cropper = null;
            }
        },

        crop() {
            const { cropper, data } = this;

            if (data.cropping && cropper) {
                this.croppedData = cropper.getData();
                this.canvasData = cropper.getCanvasData();
                this.cropBoxData = cropper.getCropBoxData();
                this.update({
                    cropped: true,
                    cropping: false,
                    previousUrl: data.url,
                    url: cropper.getCroppedCanvas(data.type === 'image/png' ? {} : {
                        fillColor: '#fff',
                    }).toDataURL(data.type),
                });
                this.stop();
            }
        },

        clear() {
            if (this.data.cropping && this.cropper) {
                this.cropper.clear();
                this.update({
                    cropping: false,
                });
            }
        },

        restore() {
            if (this.data.cropped) {
                this.update({
                    cropped: false,
                    previousUrl: '',
                    url: this.data.previousUrl,
                });
            }
        },

        reset() {
            this.stop();
            this.update({
                cropped: false,
                cropping: false,
                loaded: false,
                name: '',
                previousUrl: '',
                type: '',
                url: '',
            });
        },

        update(data: Partial<ImageData>) {
            Object.assign(this.data, data);
        },

        async handleRemoveHorizontalSeam(cropper: Cropper) {
            this.isRemovingHorizontalSeam = true;
            try {
                await removeHorizontalSeam(cropper);
            } finally {
                this.isRemovingHorizontalSeam = false;
            }
        },

        async handleRemoveVerticalSeam(cropper: Cropper) {
            this.isRemovingVerticalSeam = true;
            try {
                await removeVerticalSeam(cropper);
            } finally {
                this.isRemovingVerticalSeam = false;
            }
        },
    },
};
</script>

<style scoped>
.editor {
    height: 100%;
}

.canvas {
    align-items: center;
    display: flex;
    height: 100%;
    justify-content: center;

    &>img {
        max-height: 100%;
        max-width: 100%;
    }
}

.toolbar {
    background-color: rgba(0, 0, 0, .5);
    bottom: 1rem;
    color: #fff;
    height: 2rem;
    left: 50%;
    margin-left: -8rem;
    position: absolute;
    width: 20rem;
    z-index: 2015;
}

.toolbar__button {
    background-color: transparent;
    border-width: 0;
    color: #fff;
    cursor: pointer;
    display: block;
    float: left;
    font-size: .875rem;
    height: 2rem;
    text-align: center;
    width: 2rem;

    &:focus {
        outline: none;
    }

    &:hover:not(.toolbar__button--disabled) {
        background-color: #0074d9;
        color: #fff;
    }

    &--disabled {
        opacity: 0.6;
        cursor: not-allowed;
        
        &:hover {
            background-color: transparent;
        }
    }
}
</style>
