import Logger from './logger';

export default class EventEmitter {

    constructor(pinia = {}) {
		Logger.info('start constructor', pinia)
        Logger.info(pinia ? `Pinia adapter enabled` : `Pinia adapter disabled`);
        Logger.info(pinia.mutationPrefix ? `Pinia socket mutations enabled` : `Pinia socket mutations disabled`);
		Logger.info('mutationPrefix', pinia.mutationPrefix)
        Logger.info(pinia ? `Pinia socket actions enabled` : `Pinia socket actions disabled`);
        this.store = pinia.store;
		Logger.info('store', this.store)
        this.actionPrefix = pinia.actionPrefix ? pinia.actionPrefix : 'SOCKET_';
        this.mutationPrefix = pinia.mutationPrefix;
        this.listeners = new Map();
    }

    /**
     * register new event listener with vuejs component instance
     * @param event
     * @param callback
     * @param component
     */
    addListener(event, callback, component) {

        if (typeof callback === 'function') {

            if (!this.listeners.has(event)) this.listeners.set(event, []);
            this.listeners.get(event).push({ callback, component });

            Logger.info(`#${event} subscribe, component: ${component.$options.name}`);
        }
    }

    /**
     * emit event to all registered listeners
     * @param event
     * @param args
     */
    emit(event, ...args) {
        Logger.info('in emit', event, ...args)
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(listener => {
                listener.callback.apply(listener.component, args);
            });
        }

        if (this.store) {
            Logger.info('in emit and have store', this.mutationPrefix, this.actionPrefix)
            if (this.mutationPrefix) {
                const mutation = `${this.mutationPrefix}${event}`;
                if (this.store.hasMutation(mutation)) {
                    this.store.commit(mutation, ...args);
                }
            }

            const action = `${this.actionPrefix}${event}`;
            if (this.store.hasAction(action)) {
                this.store.dispatch(action, ...args);
            }
        }
    }

    /**
     * remove event listener
     * @param event
     * @param callback
     */
    removeListener(event, callback) {
        if (this.listeners.has(event)) {
            const listeners = this.listeners.get(event).filter(listener => listener.callback !== callback);
            this.listeners.set(event, listeners);
        }
    }
}