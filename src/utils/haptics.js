const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator

export function hapticSuccess() {
  if (canVibrate) navigator.vibrate(50)
}

export function hapticWarning() {
  if (canVibrate) navigator.vibrate([50, 30, 50])
}

export function hapticShift() {
  if (canVibrate) navigator.vibrate([20, 10, 40, 10, 20])
}

export function hapticTap() {
  if (canVibrate) navigator.vibrate(10)
}
