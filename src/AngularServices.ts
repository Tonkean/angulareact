import type {
    IAnchorScrollService,
    ICacheFactoryService,
    ICompileService,
    IControllerService,
    IDocumentService,
    IExceptionHandlerService,
    IFilterService,
    IHttpBackendService,
    IHttpParamSerializer,
    IHttpService,
    IInterpolateService,
    IIntervalService,
    ILocaleService,
    ILocationService,
    ILogService,
    IParseService,
    IQService,
    IRootElementService,
    IRootScopeService,
    ISCEDelegateService,
    ISCEService,
    ITemplateCacheService,
    ITemplateRequestService,
    ITimeoutService,
    IWindowService,
    IXhrFactory,
} from 'angular';

interface AngularServices {
    $anchorScroll: IAnchorScrollService;
    $cacheFactory: ICacheFactoryService;
    $compile: ICompileService;
    $controller: IControllerService;
    $document: IDocumentService;
    $exceptionHandler: IExceptionHandlerService;
    $filter: IFilterService;
    $http: IHttpService;
    $httpBackend: IHttpBackendService;
    $httpParamSerializer: IHttpParamSerializer;
    $httpParamSerializerJQLike: IHttpParamSerializer;
    $interpolate: IInterpolateService;
    $interval: IIntervalService;
    $locale: ILocaleService;
    $location: ILocationService;
    $log: ILogService;
    $parse: IParseService;
    $q: IQService;
    $rootElement: IRootElementService;
    $rootScope: IRootScopeService;
    $sce: ISCEService;
    $sceDelegate: ISCEDelegateService;
    $templateCache: ITemplateCacheService;
    $templateRequest: ITemplateRequestService;
    $timeout: ITimeoutService;
    $window: IWindowService;
    $xhrFactory: IXhrFactory<unknown>;

    [key: string]: any;
}

export default AngularServices;
