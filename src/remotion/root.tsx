import { Composition } from "remotion";
import { LuaBrancaIntro } from "./lua-branca-intro";

export function RemotionRoot() {
  return (
    <Composition
      id="LuaBrancaIntro"
      component={LuaBrancaIntro}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  );
}
