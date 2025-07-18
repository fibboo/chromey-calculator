// Work around for bug Chrome bug where popup won't get focus (see http://code.google.com/p/chromium/issues/detail?id=111660#c7)
// This script is currently commented out but kept for reference
/*
if(location.search !== "?foo") {
  location.search = "?foo";
  throw new Error;  // load everything on the next page;
                   // stop execution on this page
}
*/