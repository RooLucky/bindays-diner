// Browser permission prompts and video playback may otherwise stay pending forever.
export function withCameraTimeout<T>(
  operation: Promise<T>,
  milliseconds: number,
  message: string,
  disposeLateResult?: (value: T) => void,
): Promise<T> {
  return new Promise((resolve, reject) => {
    let expired = false;
    const timer = setTimeout(() => {
      expired = true;
      const error = new Error(message);
      error.name = "CameraTimeoutError";
      reject(error);
    }, milliseconds);
    operation.then(
      (value) => {
        clearTimeout(timer);
        if (expired) disposeLateResult?.(value);
        else resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        if (!expired) reject(error);
      },
    );
  });
}
