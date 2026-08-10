export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export function validateSignup({ name, email, password, passwordConfirm }) {
  if (!name.trim() || !email.trim() || !password || !passwordConfirm) return "모든 항목을 입력해 주세요.";
  if (!isEmail(email.trim())) return "올바른 이메일 형식을 입력해 주세요.";
  if (password.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
  if (password !== passwordConfirm) return "비밀번호가 일치하지 않습니다.";
  return "";
}
