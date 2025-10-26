import "./reset.js";
import "../components/utils/atom-icon.js";
import "../components/utils/alert-toast.js";
// @ts-ignore
import baseCss from "../style/base.css" with { type: "css" };
import popupCss from "../style/popup.css" with { type: "css" };
document.adoptedStyleSheets.push(baseCss, popupCss);

import { HighlightedDetails } from "../components/highlighted/highlighted-details.js";
import { AutoHighlightForm } from "../components/ai-highlight/auto-highlight.js";
import { UserOnboardForm } from "../components/onboard/user-onboard-form.js";
import { Headerbar } from "../components/header-bar.js";

getStore("userProfile").then(({ userProfile }) => {
    if(!userProfile) return  document.body.append(new UserOnboardForm());
	
	document.body.append(new Headerbar(), new AutoHighlightForm())
	document.body.append(new HighlightedDetails());
	
});
