/**
 * @param {string} path
 */
async function getJSONFromFile(path = "") {
  let module = null;
  try {
    module = await import("" + new URL(path, window.location).href, {
      with: { type: "json" },
    });
  } catch (error) {}
  return module?.default;
}
export { getJSONFromFile };
