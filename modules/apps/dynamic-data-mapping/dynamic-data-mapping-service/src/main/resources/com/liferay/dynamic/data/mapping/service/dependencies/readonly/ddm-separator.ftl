<#include "../init.ftl">

<div class="my-3 position-relative">
	<hr class="position-absolute separator lfr-ddm-separator--hr" />

	<label class="position-relative">
		<@liferay_ui.message key=escape(label) />
	</label>
</div>

<aui:style type="text/css">
	.lfr-ddm-separator--hr {
		top: 50%;
	}
</aui:style>

${fieldStructure.children}