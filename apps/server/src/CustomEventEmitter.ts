import EventEmitter from 'events';

export class CustomEventEmitter<TEvents extends Record<string, any>> {
    private emitter = new EventEmitter();

    emit<TEventName extends keyof TEvents & string>(
        eventName: TEventName,
        args: TEvents[TEventName],
    ) {
        this.emitter.emit(eventName, args);
    }

    on<TEventName extends keyof TEvents & string>(
        eventName: TEventName,
        handler: (parameters: TEvents[TEventName]) => void,
    ) {
        this.emitter.on(eventName, handler);
    }

    off<TEventName extends keyof TEvents & string>(
        eventName: TEventName,
        handler: (parameters: TEvents[TEventName]) => void,
    ) {
        this.emitter.off(eventName, handler);
    }
}
