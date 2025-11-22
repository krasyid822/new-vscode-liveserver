declare module 'selfsigned' {
    export interface GenerateOptions {
        keySize?: number;
        days?: number;
        algorithm?: string;
        extensions?: Array<Record<string, unknown>>;
    }

    export interface Pems {
        private: string;
        public: string;
        cert: string;
    }

    export function generate(attrs?: Array<Record<string, string>>, options?: GenerateOptions): Pems;

    const selfsigned: {
        generate: typeof generate;
    };

    export default selfsigned;
}
