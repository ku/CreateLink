
#include <stdio.h>
#include <stdlib.h>
#include <windows.h>

typedef unsigned short uint16;
typedef int int32;
typedef short int16;


#include <npapi/npapi.h>
#include <npapi/nptypes.h>
#include <npapi/npruntime.h>
#include <npapi/npfunctions.h>

#define FUNCNAME_SET_CLIPBOARD	"set"

static NPObject *so              = NULL;
static NPNetscapeFuncs *npnfuncs = NULL;

static void logmsg(const char *msg) {
	FILE *out = fopen("c:\\clipboard.log", "ab");
	fputs(msg, out);
	fclose(out);
}

static bool hasMethod(NPObject* obj, NPIdentifier methodName) {
    char *name = npnfuncs->utf8fromidentifier(methodName);
    if ( strcmp(name, FUNCNAME_SET_CLIPBOARD) == 0 ) {
        return true;
    } else {
    	return false;
    }
}

static bool invoke(NPObject* obj, NPIdentifier methodName, const NPVariant *args, uint32_t argCount, NPVariant *result) {
    NPUTF8 *name = npnfuncs->utf8fromidentifier(methodName);
	BOOLEAN_TO_NPVARIANT(false, *result);
	if ( strcmp(name, FUNCNAME_SET_CLIPBOARD) == 0 ) {
		if ( argCount < 1 ) {
			npnfuncs->setexception(obj, "Parameter 1 is required.");
			return false;
		}
		if ( OpenClipboard(NULL) == 0 ) {
			npnfuncs->setexception(obj, "OpenClipboard failed.");
			return false;
		}
		EmptyClipboard();
		
		NPString arg0 = NPVARIANT_TO_STRING(args[0]);
		const char* utf8string = arg0.UTF8Characters;
		
		int charactersInUTF16 = ::MultiByteToWideChar(CP_UTF8, 0, utf8string, -1, NULL, 0 );
		if ( charactersInUTF16 <= 0 ) {
			CloseClipboard();
			BOOLEAN_TO_NPVARIANT(true, *result);
			return true;
		}
		
		int bytesInUTF16 = charactersInUTF16 * sizeof(WCHAR);
		
		HANDLE h = GlobalAlloc(GHND | GMEM_SHARE, bytesInUTF16);
		LPVOID lockedMemory = GlobalLock(h);
		::MultiByteToWideChar(CP_UTF8, 0, utf8string, -1, (LPWSTR)lockedMemory, bytesInUTF16 );
		GlobalUnlock(h);

		if ( SetClipboardData(CF_UNICODETEXT, h) == NULL ) {
			npnfuncs->setexception(obj, "SetClipboardData failed.");
			return false;
		}
		CloseClipboard();
		BOOLEAN_TO_NPVARIANT(true, *result);
		return true;
	} else {
		npnfuncs->setexception(obj, "no such method.");
		return false;
	}
}


static NPClass npcRefObject = {
	NP_CLASS_STRUCT_VERSION,
	NULL,
	NULL,
	NULL,
	hasMethod,
	invoke, //	invoke,
	NULL, //	invokeDefault,
	NULL, //	hasProperty,
	NULL, //	getProperty,
	NULL,
	NULL,
};

/* EXPORT */
#ifdef __cplusplus
extern "C" {
#endif


/* NPP */

static NPError
nevv(NPMIMEType pluginType, NPP instance, uint16 mode, int16 argc, char *argn[], char *argv[], NPSavedData *saved) {
    return NPERR_NO_ERROR;
}

static NPError
destroy(NPP instance, NPSavedData **save) {
    if(so)
        npnfuncs->releaseobject(so);
    so = NULL;
    return NPERR_NO_ERROR;
}


static NPError
getValue(NPP instance, NPPVariable variable, void *value) {
 	switch(variable) {
	default:
		return NPERR_GENERIC_ERROR;
	case NPPVpluginNameString:
		*((char **)value) = "Chrome Extension Clipborad Helper";
		break;
	case NPPVpluginDescriptionString:
		*((char **)value) = "an NPAPI extension to utilizing clipboard.";
		break;
	case NPPVpluginScriptableNPObject:
		if(!so)
			so = npnfuncs->createobject(instance, &npcRefObject);
		npnfuncs->retainobject(so);
		*(NPObject **)value = so;
		break;
#if defined(XULRUNNER_SDK)
	case NPPVpluginNeedsXEmbed:
//		*((PRBool *)value) = PR_FALSE;
		break;
#endif
	}
	return NPERR_NO_ERROR;
}


NPError OSCALL
NP_GetEntryPoints(NPPluginFuncs *nppfuncs) {
	nppfuncs->version       = (NP_VERSION_MAJOR << 8) | NP_VERSION_MINOR;
	nppfuncs->newp          = nevv;
    nppfuncs->destroy       = destroy;
    nppfuncs->getvalue      = getValue;
	return NPERR_NO_ERROR;
}
NPError OSCALL
NP_Initialize(NPNetscapeFuncs *npnf
#if !defined(WIN32) && !defined(WEBKIT_DARWIN_SDK)
			, NPPluginFuncs *nppfuncs)
#else
			)
#endif
{
	if(npnf == NULL)
		return NPERR_INVALID_FUNCTABLE_ERROR;

	if(HIBYTE(npnf->version) > NP_VERSION_MAJOR)
		return NPERR_INCOMPATIBLE_VERSION_ERROR;

	npnfuncs = npnf;
#if !defined(WIN32) && !defined(WEBKIT_DARWIN_SDK)
	NP_GetEntryPoints(nppfuncs);
#endif
	return NPERR_NO_ERROR;
}

NPError OSCALL NP_Shutdown() {
 	return NPERR_NO_ERROR;
}

char * NP_GetMIMEDescription(void) {
	return "application/x-chrome-npapi-clipboard:.:clipboard@ido.nu";
}

NPError OSCALL /* needs to be present for WebKit based browsers */
NP_GetValue(void *npp, NPPVariable variable, void *value) {
	return getValue((NPP)npp, variable, value);
}

#ifdef __cplusplus
}
#endif
