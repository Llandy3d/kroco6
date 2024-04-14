export interface BrowserRequest {
    headers: Array<Array<string>>;
    host: string,
    method: string,
    path: string,
    timestamp_start: Date,
}

export interface BrowserResponse {
    headers: Array<Array<string>>;
    reason: string,
    status_code: number,
    path: string,
    timestamp_start: Date,
}

export interface BrowserEvent {
    request: BrowserRequest,
    response?: BrowserResponse,
}
