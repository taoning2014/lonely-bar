<template>
    <div class="loader" @change="change" @dragover="dragover" @drop="drop">
        <p>
            Paste or drop image here or
            <label class="browse">browse...
                <input id="file" class="sr-only" type="file" accept="image/*">
            </label>
        </p>
    </div>
</template>

<script lang="ts">
import type { ImageData } from '../types/index';

interface LoaderData {
    onPaste?: (event: ClipboardEvent) => void;
}

const URL = window.URL || window.webkitURL;
const REGEXP_MIME_TYPE_IMAGES = /^image\/\w+$/;
const REGEXP_URLS = /^(?:https?|data):/;

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

    data(): LoaderData {
        return {};
    },

    mounted() {
        this.$el.ownerDocument.addEventListener('paste', (this.onPaste = this.paste.bind(this)));
    },

    beforeDestroy() {
        this.$el.ownerDocument.removeEventListener('paste', this.onPaste);
    },

    methods: {
        read(file: File, event?: DragEvent | ClipboardEvent): Promise<Partial<ImageData>> {
            return new Promise((resolve, reject) => {
                if (!file) {
                    resolve({});
                    return;
                }

                if (REGEXP_MIME_TYPE_IMAGES.test(file.type)) {
                    if (URL) {
                        resolve({
                            loaded: true,
                            name: file.name,
                            type: file.type,
                            url: URL.createObjectURL(file),
                        });
                    } else {
                        reject(new Error('Your browser is not supported.'));
                    }
                } else {
                    reject(new Error(`Please ${event ? event.type : 'choose'} an image file.`));
                }
            });
        },

        change(event: Event) {
            const target = event.target as HTMLInputElement;
            const { files } = target;

            if (files && files.length > 0) {
                this.read(files[0]).then((data) => {
                    target.value = '';
                    this.update(data);
                }).catch((e) => {
                    target.value = '';
                    this.alert(e);
                });
            }
        },

        dragover(e: DragEvent) {
            e.preventDefault();
        },

        drop(e: DragEvent) {
            const { files } = e.dataTransfer as DataTransfer;

            e.preventDefault();

            if (files && files.length > 0) {
                this.read(files[0], e)
                    .then((data) => {
                        this.update(data);
                    })
                    .catch(this.alert);
            }
        },

        paste(e: ClipboardEvent) {
            const { items } = e.clipboardData as DataTransfer;

            e.preventDefault();

            if (items && items.length > 0) {
                new Promise((resolve, reject) => {
                    const item = Array.from(items).pop();
                    const error = new Error('Please paste an image file or URL.');
                    if (!item) {
                        reject(error);
                        return;
                    }

                    if (item.kind === 'file') {
                        resolve(item.getAsFile());
                    } else if (item.kind === 'string') {
                        item.getAsString((url) => {
                            if (REGEXP_URLS.test(url)) {
                                const xhr = new XMLHttpRequest();
                                const alert = () => {
                                    reject(error);
                                };

                                xhr.onabort = alert;
                                xhr.onerror = alert;
                                xhr.ontimeout = alert;

                                xhr.onprogress = () => {
                                    const contentType = xhr.getResponseHeader('content-type');
                                    if (contentType && !REGEXP_MIME_TYPE_IMAGES.test(contentType)) {
                                        xhr.abort();
                                    }
                                };

                                xhr.onload = () => {
                                    resolve(xhr.response);
                                };

                                xhr.open('GET', url, true);
                                xhr.responseType = 'blob';
                                xhr.send();
                            } else {
                                reject(error);
                            }
                        });
                    } else {
                        reject(error);
                    }
                })
                    .then((blob) => this.read(blob as File, e).then((data) => {
                        this.update(data);
                    }))
                    .catch(this.alert);
            }
        },

        alert(e: Error) {
            window.alert(e && e.message ? e.message : e);
        },

        update(data: Partial<ImageData>) {
            Object.assign(this.data, data);
        },
    },
};
</script>

<style scoped>
.loader {
    display: table;
    height: 100%;
    overflow: hidden;
    width: 100%;

    &>p {
        color: #999;
        display: table-cell;
        text-align: center;
        vertical-align: middle;
    }
}

.browse {
    color: #0074d9;
    cursor: pointer;
    margin-left: .25rem;

    &:hover {
        color: #08f;
        text-decoration: underline;
    }
}
</style>