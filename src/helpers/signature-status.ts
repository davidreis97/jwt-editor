export default interface SignatureStatus {
    status: Status,
    message: string
}

export type Status = "info" | "invalid" | "valid"