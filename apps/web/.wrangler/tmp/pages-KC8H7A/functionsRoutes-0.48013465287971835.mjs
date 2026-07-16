import { onRequestPost as __api_upload_js_onRequestPost } from "C:\\Users\\baodh\\OneDrive\\Desktop\\Projects\\VaultOne\\apps\\web\\functions\\api\\upload.js"

export const routes = [
    {
      routePath: "/api/upload",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_upload_js_onRequestPost],
    },
  ]