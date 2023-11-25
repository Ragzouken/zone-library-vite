import { SyntheticEvent, useCallback } from "react";

function Auth(props: { tryPassword: (password: string) => void }) {
  const onSubmit = useCallback((event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();
    const password = new FormData(event.currentTarget).get("password") as string;
    props.tryPassword(password);
  }, [props.tryPassword]);
  
  return (
    <form onSubmit={onSubmit}>
      <fieldset>
        <legend>authorization</legend>
        <label>
          🔑
          <input type="password" name="password" autoComplete="current-password" required></input>
        </label>
        <input type="submit" value="check" />
      </fieldset>
    </form>
  ); 
}

export default Auth;
