export type ActionResult<TField extends string = string> = {
  fieldErrors?: Partial<Record<TField, string[]>>
  message: string
  success: boolean
}
