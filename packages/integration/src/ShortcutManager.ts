export class ShortcutManager {
    constructor(private handlers: Record<string, () => void>) {}

    mount() {
        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', this.handleKeyDown);
        }
    }

    unmount() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('keydown', this.handleKeyDown);
        }
    }

    private handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
            const key = e.key.toUpperCase();
            // Handle letters
            if (this.handlers[key]) {
                e.preventDefault();
                this.handlers[key]();
            }
        }
    }
}
