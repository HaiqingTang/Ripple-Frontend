import { Redirect } from "expo-router";

export default function Index() {
  // 直接跳到 Challenge 首页
  return <Redirect href="/Challenge" />;
  // 或跳到 Interest 首页
  // return <Redirect href="/Interest" />;
}
