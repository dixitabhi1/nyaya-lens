import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Download,
  FileText,
  IndianRupee,
  Lock,
  PenTool,
  RefreshCw,
  ShoppingBag,
  Store,
  UploadCloud,
  UserRound,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import { NoticeBanner } from "@/components/shared/NoticeBanner";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuth } from "@/lib/auth-context";
import {
  checkoutDocumentTemplate,
  createDocumentTemplate,
  getDocumentOrder,
  getDocumentTemplate,
  getDocumentTemplates,
  getMyDocumentOrders,
  verifyDocumentPayment,
  type DocumentOrderDetail,
  type DocumentOrderSummary,
  type DocumentTemplateCheckoutResponse,
  type DocumentTemplateDetail,
  type DocumentTemplateSummary,
} from "@/services/api";

type UploadFieldState = {
  key: string;
  label: string;
  input_type: string;
  placeholder: string;
  help_text: string;
  required: boolean;
  options: string;
};

const emptyUploadField = (): UploadFieldState => ({
  key: "",
  label: "",
  input_type: "text",
  placeholder: "",
  help_text: "",
  required: true,
  options: "",
});

const emptyAnswers: Record<string, string> = {};

function slugifyFieldKey(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

async function ensureRazorpayLoaded() {
  const existing = (window as Window & { Razorpay?: any }).Razorpay;
  if (existing) {
    return existing;
  }
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Razorpay Checkout right now."));
    document.body.appendChild(script);
  });
  const Razorpay = (window as Window & { Razorpay?: any }).Razorpay;
  if (!Razorpay) {
    throw new Error("Razorpay Checkout did not initialize correctly.");
  }
  return Razorpay;
}

export default function DraftingPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [templates, setTemplates] = useState<DocumentTemplateSummary[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplateDetail | null>(null);
  const [orders, setOrders] = useState<DocumentOrderSummary[]>([]);
  const [activeOrder, setActiveOrder] = useState<DocumentOrderDetail | null>(null);
  const [checkoutResponse, setCheckoutResponse] = useState<DocumentTemplateCheckoutResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>(emptyAnswers);
  const [search, setSearch] = useState("");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("");
  const [onlyFree, setOnlyFree] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [error, setError] = useState("");
  const [publishError, setPublishError] = useState("");
  const [publishForm, setPublishForm] = useState({
    title: "",
    document_type: "",
    category: "",
    description: "",
    price_rupees: "0",
    template_body: "",
    tags: "",
    template_file: null as File | null,
  });
  const [uploadFields, setUploadFields] = useState<UploadFieldState[]>([emptyUploadField()]);

  const canUploadTemplates = Boolean(user?.can_access_lawyer_dashboard || user?.can_access_admin_dashboard);

  const availableDocumentTypes = useMemo(() => {
    const items = new Set<string>();
    for (const template of templates) {
      if (template.document_type) items.add(template.document_type);
    }
    return Array.from(items).sort((a, b) => a.localeCompare(b));
  }, [templates]);

  async function loadTemplates() {
    setTemplatesLoading(true);
    try {
      const data = await getDocumentTemplates({
        query: search.trim() || undefined,
        documentType: documentTypeFilter || undefined,
        onlyFree,
        limit: 36,
      });
      setTemplates(data.templates);
      setError("");
      setSelectedTemplateId((current) => {
        if (current && data.templates.some((template) => template.id === current)) {
          return current;
        }
        return data.templates[0]?.id ?? null;
      });
    } catch (err: any) {
      setError(err?.message || "Unable to load document templates.");
    } finally {
      setTemplatesLoading(false);
    }
  }

  async function loadOrders() {
    setOrdersLoading(true);
    try {
      const data = await getMyDocumentOrders(20);
      setOrders(data.orders);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }

  useEffect(() => {
    void loadTemplates();
  }, [search, documentTypeFilter, onlyFree]);

  useEffect(() => {
    if (!user) return;
    void loadOrders();
  }, [user?.id]);

  useEffect(() => {
    async function loadSelectedTemplate() {
      if (!selectedTemplateId) {
        setSelectedTemplate(null);
        setAnswers(emptyAnswers);
        return;
      }
      setTemplateLoading(true);
      try {
        const detail = await getDocumentTemplate(selectedTemplateId);
        setSelectedTemplate(detail);
        setAnswers(
          detail.fields.reduce<Record<string, string>>((acc, field) => {
            acc[field.key] = detail.sample_input?.[field.key] ?? "";
            return acc;
          }, {}),
        );
        setCheckoutResponse(null);
        setActiveOrder(null);
        setError("");
      } catch (err: any) {
        setError(err?.message || "Unable to load template details.");
      } finally {
        setTemplateLoading(false);
      }
    }

    void loadSelectedTemplate();
  }, [selectedTemplateId]);

  const orderPreview = activeOrder ?? checkoutResponse?.order ?? null;

  async function handleCheckout() {
    if (!selectedTemplate || checkoutLoading) return;
    setCheckoutLoading(true);
    setError("");
    try {
      const response = await checkoutDocumentTemplate(selectedTemplate.id, answers);
      setCheckoutResponse(response);
      setActiveOrder(response.order);
      await loadOrders();

      if (response.payment_required && response.gateway_ready && response.checkout) {
        const Razorpay = await ensureRazorpayLoaded();
        await new Promise<void>((resolve, reject) => {
          const instance = new Razorpay({
            key: response.checkout?.public_key,
            amount: response.checkout?.amount_paise,
            currency: response.checkout?.currency,
            name: response.checkout?.business_name,
            description: response.checkout?.description,
            order_id: response.checkout?.order_reference,
            prefill: {
              name: response.checkout?.buyer_name || user?.full_name,
              email: response.checkout?.buyer_email || user?.email,
            },
            theme: { color: "#F59E0B" },
            handler: async (paymentResponse: any) => {
              try {
                const verified = await verifyDocumentPayment(response.order.id, {
                  provider: "razorpay",
                  payment_id: paymentResponse.razorpay_payment_id,
                  order_reference: paymentResponse.razorpay_order_id,
                  signature: paymentResponse.razorpay_signature,
                });
                setActiveOrder(verified);
                setCheckoutResponse({
                  ...response,
                  order: verified,
                  payment_required: false,
                  checkout: null,
                  message: "Payment verified and document unlocked successfully.",
                });
                toast({
                  title: "Payment successful",
                  description: "Your lawyer-crafted document is now unlocked.",
                });
                await loadOrders();
                resolve();
              } catch (err: any) {
                reject(new Error(err?.message || "Payment verification failed."));
              }
            },
            modal: {
              ondismiss: () => resolve(),
            },
          });
          instance.open();
        });
      } else {
        toast({
          title: response.payment_required ? "Paid checkout not ready yet" : "Document unlocked",
          description: response.message,
        });
      }
    } catch (err: any) {
      setError(err?.message || "Unable to continue with document checkout.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handleOpenOrder(orderId: number) {
    try {
      const detail = await getDocumentOrder(orderId);
      setActiveOrder(detail);
      setCheckoutResponse(null);
    } catch (err: any) {
      setError(err?.message || "Unable to load that document order.");
    }
  }

  function handleDownloadDocument() {
    if (!orderPreview?.generated_document_text) return;
    const templateSlug = selectedTemplate?.slug || orderPreview.template_slug || "nyayasetu-document";
    const blob = new Blob([orderPreview.generated_document_text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${templateSlug}-${orderPreview.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function updateUploadField(index: number, patch: Partial<UploadFieldState>) {
    setUploadFields((current) =>
      current.map((field, fieldIndex) => {
        if (fieldIndex !== index) return field;
        const next = { ...field, ...patch };
        if ("label" in patch && (!field.key || field.key === slugifyFieldKey(field.label))) {
          next.key = slugifyFieldKey(String(patch.label || ""));
        }
        return next;
      }),
    );
  }

  async function handlePublishTemplate() {
    if (!canUploadTemplates || publishLoading) return;
    setPublishLoading(true);
    setPublishError("");
    try {
      const formData = new FormData();
      formData.append("title", publishForm.title);
      formData.append("document_type", publishForm.document_type);
      formData.append("category", publishForm.category || "general");
      formData.append("description", publishForm.description);
      formData.append("price_rupees", publishForm.price_rupees || "0");
      formData.append("template_body", publishForm.template_body);
      formData.append(
        "fields_json",
        JSON.stringify(
          uploadFields
            .filter((field) => field.label.trim())
            .map((field) => ({
              key: field.key.trim() || slugifyFieldKey(field.label),
              label: field.label.trim(),
              input_type: field.input_type,
              placeholder: field.placeholder.trim() || undefined,
              help_text: field.help_text.trim() || undefined,
              required: field.required,
              options: field.options
                .split(",")
                .map((option) => option.trim())
                .filter(Boolean),
            })),
        ),
      );
      formData.append(
        "tags_json",
        JSON.stringify(
          publishForm.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        ),
      );
      formData.append("sample_input_json", JSON.stringify({}));
      formData.append("is_published", "true");
      if (publishForm.template_file) {
        formData.append("template_file", publishForm.template_file);
      }

      const created = await createDocumentTemplate(formData);
      toast({
        title: "Template published",
        description: `${created.title} is now visible in the document marketplace.`,
      });
      setPublishForm({
        title: "",
        document_type: "",
        category: "",
        description: "",
        price_rupees: "0",
        template_body: "",
        tags: "",
        template_file: null,
      });
      setUploadFields([emptyUploadField()]);
      await loadTemplates();
      setSelectedTemplateId(created.id);
    } catch (err: any) {
      setPublishError(err?.message || "Unable to publish this template.");
    } finally {
      setPublishLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <PageHeader
        title="Document Marketplace"
        description="Browse lawyer-uploaded legal document templates, fill the required details, and unlock the final draft with free or paid checkout."
      />

      <Card className="rounded-[30px] border-slate-200 bg-white/95 shadow-xl shadow-slate-200/40">
        <CardContent className="grid gap-4 p-6 lg:grid-cols-[minmax(0,1fr)_repeat(3,minmax(180px,220px))]">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Marketplace search</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">Lawyer-crafted templates, not generic AI drafts</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Each listing shows the document type, rate, lawyer or admin uploader, and how many buyers have already used it.
            </p>
          </div>
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notices, agreements, affidavits..." />
          <select
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
            value={documentTypeFilter}
            onChange={(event) => setDocumentTypeFilter(event.target.value)}
          >
            <option value="">All document types</option>
            {availableDocumentTypes.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <label className="flex h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700">
            <span>Only free documents</span>
            <input type="checkbox" checked={onlyFree} onChange={(event) => setOnlyFree(event.target.checked)} />
          </label>
        </CardContent>
      </Card>

      {error ? <NoticeBanner variant="error">{error}</NoticeBanner> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <div className="space-y-6">
          <Card className="rounded-[30px] border-slate-200 bg-white/95 shadow-xl shadow-slate-200/40">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Available templates</p>
                  <h2 className="font-display text-3xl font-bold text-slate-950">Choose a legal document</h2>
                </div>
                <Button type="button" variant="outline" className="rounded-full" onClick={() => void loadTemplates()}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                </Button>
              </div>

              {templatesLoading ? (
                <LoadingState message="Loading lawyer templates..." />
              ) : templates.length === 0 ? (
                <EmptyState
                  message="No document templates yet"
                  sub={canUploadTemplates ? "Publish the first template from the lawyer upload studio." : "No lawyer has published a document template yet."}
                />
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(template.id)}
                      className={`rounded-[26px] border p-5 text-left transition ${
                        selectedTemplateId === template.id
                          ? "border-amber-400 bg-amber-50/70 shadow-lg shadow-amber-100"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="rounded-full bg-slate-900 text-white hover:bg-slate-900">
                              {template.document_type}
                            </Badge>
                            <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 text-slate-600">
                              {template.category}
                            </Badge>
                          </div>
                          <h3 className="mt-3 font-display text-2xl font-bold text-slate-950">{template.title}</h3>
                          <p className="mt-2 text-sm leading-7 text-slate-600">{template.description}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-950 px-4 py-3 text-right text-white">
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-300">Rate</p>
                          <p className="mt-1 text-lg font-semibold">{template.price_display}</p>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                        <div className="flex items-center gap-2">
                          <UserRound className="h-4 w-4 text-slate-400" />
                          <span>{template.uploaded_by_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span>{template.buyer_count} buyers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4 text-slate-400" />
                          <span>{template.purchase_count} unlocks</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[30px] border-slate-200 bg-white/95 shadow-xl shadow-slate-200/40">
            <CardContent className="space-y-6 p-6">
              {templateLoading ? (
                <LoadingState message="Loading selected template..." />
              ) : !selectedTemplate ? (
                <EmptyState message="Select a template" sub="Pick one of the uploaded templates to fill the details and unlock the final draft." />
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="rounded-full bg-amber-100 text-amber-900 hover:bg-amber-100">
                          {selectedTemplate.price_display}
                        </Badge>
                        <Badge variant="outline" className="rounded-full border-slate-200 bg-white text-slate-600">
                          {selectedTemplate.document_type}
                        </Badge>
                        <Badge variant="outline" className="rounded-full border-slate-200 bg-white text-slate-600">
                          Uploaded by {selectedTemplate.uploaded_by_name}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Selected template</p>
                        <h2 className="mt-2 font-display text-4xl font-bold text-slate-950">{selectedTemplate.title}</h2>
                        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{selectedTemplate.description}</p>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
                      <p><strong>{selectedTemplate.buyer_count}</strong> unique buyers</p>
                      <p className="mt-1"><strong>{selectedTemplate.purchase_count}</strong> total unlocks</p>
                      <p className="mt-1"><strong>{selectedTemplate.field_count}</strong> fillable fields</p>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
                    <div className="space-y-4">
                      {selectedTemplate.fields.map((field) => (
                        <label key={field.key} className="block space-y-2">
                          <span className="text-sm font-medium text-slate-700">
                            {field.label}
                            {field.required ? " *" : ""}
                          </span>
                          {field.input_type === "textarea" ? (
                            <Textarea
                              value={answers[field.key] || ""}
                              onChange={(event) => setAnswers((current) => ({ ...current, [field.key]: event.target.value }))}
                              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                              rows={4}
                            />
                          ) : field.input_type === "select" ? (
                            <select
                              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
                              value={answers[field.key] || ""}
                              onChange={(event) => setAnswers((current) => ({ ...current, [field.key]: event.target.value }))}
                            >
                              <option value="">{field.placeholder || `Select ${field.label.toLowerCase()}`}</option>
                              {field.options.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : (
                            <Input
                              type={field.input_type === "phone" ? "tel" : field.input_type}
                              value={answers[field.key] || ""}
                              onChange={(event) => setAnswers((current) => ({ ...current, [field.key]: event.target.value }))}
                              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                            />
                          )}
                          {field.help_text ? <p className="text-xs text-slate-500">{field.help_text}</p> : null}
                        </label>
                      ))}

                      <div className="flex flex-wrap gap-3">
                        <Button type="button" className="rounded-full" disabled={checkoutLoading} onClick={() => void handleCheckout()}>
                          {checkoutLoading ? (
                            <>Processing...</>
                          ) : selectedTemplate.is_free ? (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Unlock free document
                            </>
                          ) : selectedTemplate.payment_gateway_ready ? (
                            <>
                              <IndianRupee className="mr-2 h-4 w-4" /> Pay {selectedTemplate.price_display} and unlock
                            </>
                          ) : (
                            <>
                              <Lock className="mr-2 h-4 w-4" /> Payment setup required
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => setAnswers(selectedTemplate.sample_input || {})}
                        >
                          Use sample values
                        </Button>
                      </div>

                      {!selectedTemplate.is_free && !selectedTemplate.payment_gateway_ready ? (
                        <NoticeBanner>
                          Paid checkout is ready in code, but the payment gateway keys are not configured yet. Free templates still unlock immediately.
                        </NoticeBanner>
                      ) : null}
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Template preview</p>
                      <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap text-sm leading-7 text-slate-700">
                        {selectedTemplate.template_body_preview}
                      </pre>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[30px] border-slate-200 bg-white/95 shadow-xl shadow-slate-200/40">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-slate-700" />
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Unlocked result</p>
                  <h2 className="font-display text-3xl font-bold text-slate-950">Generated document</h2>
                </div>
              </div>
              {!orderPreview ? (
                <EmptyState message="No document generated yet" sub="Select a template, fill the basic details, and unlock the final document here." />
              ) : orderPreview.access_granted && orderPreview.generated_document_text ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                      {orderPreview.payment_status}
                    </Badge>
                    <Badge variant="outline" className="rounded-full border-slate-200 bg-white text-slate-600">
                      {orderPreview.amount_display}
                    </Badge>
                    <Button type="button" variant="outline" className="rounded-full" onClick={handleDownloadDocument}>
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                  </div>
                  <pre className="max-h-[540px] overflow-auto rounded-[24px] border border-slate-200 bg-slate-50 p-5 whitespace-pre-wrap text-sm leading-7 text-slate-800">
                    {orderPreview.generated_document_text}
                  </pre>
                </div>
              ) : (
                <NoticeBanner>
                  {checkoutResponse?.message || "This document order is still locked because payment has not been completed yet."}
                </NoticeBanner>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[30px] border-slate-200 bg-white/95 shadow-xl shadow-slate-200/40">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <Store className="h-5 w-5 text-slate-700" />
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">My library</p>
                  <h2 className="font-display text-2xl font-bold text-slate-950">Recent purchases and free unlocks</h2>
                </div>
              </div>

              {ordersLoading ? (
                <LoadingState message="Loading your document orders..." />
              ) : orders.length === 0 ? (
                <EmptyState message="No document orders yet" sub="Once you unlock a document, it will appear here for quick access." />
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => void handleOpenOrder(order.id)}
                      className="w-full rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-slate-950">{order.template_title}</p>
                          <p className="mt-1 text-sm text-slate-600">{order.amount_display} • {order.payment_status}</p>
                          <p className="mt-2 text-xs text-slate-500">{new Date(order.updated_at).toLocaleString()}</p>
                        </div>
                        <Badge variant="outline" className="rounded-full border-slate-200 bg-white text-slate-600">
                          {order.access_granted ? "Unlocked" : "Locked"}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {canUploadTemplates ? (
            <Card className="rounded-[30px] border-slate-200 bg-white/95 shadow-xl shadow-slate-200/40">
              <CardContent className="space-y-5 p-6">
                <div className="flex items-center gap-3">
                  <UploadCloud className="h-5 w-5 text-slate-700" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Lawyer upload studio</p>
                    <h2 className="font-display text-2xl font-bold text-slate-950">Publish a pre-built document</h2>
                  </div>
                </div>
                <p className="text-sm leading-7 text-slate-600">
                  Upload or paste the lawyer-approved template, define the fillable fields, and set a free or paid rate. Use placeholders like <code>{"{{tenant_name}}"}</code> in the template text.
                </p>
                {publishError ? <NoticeBanner variant="error">{publishError}</NoticeBanner> : null}

                <div className="space-y-4">
                  <Input
                    value={publishForm.title}
                    onChange={(event) => setPublishForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Document title"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      value={publishForm.document_type}
                      onChange={(event) => setPublishForm((current) => ({ ...current, document_type: event.target.value }))}
                      placeholder="Document type (e.g. Rental Agreement)"
                    />
                    <Input
                      value={publishForm.category}
                      onChange={(event) => setPublishForm((current) => ({ ...current, category: event.target.value }))}
                      placeholder="Category (e.g. property)"
                    />
                  </div>
                  <Textarea
                    value={publishForm.description}
                    onChange={(event) => setPublishForm((current) => ({ ...current, description: event.target.value }))}
                    placeholder="Short marketplace description for users"
                    rows={3}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      value={publishForm.price_rupees}
                      onChange={(event) => setPublishForm((current) => ({ ...current, price_rupees: event.target.value }))}
                      placeholder="Price in INR (0 for free)"
                    />
                    <Input
                      value={publishForm.tags}
                      onChange={(event) => setPublishForm((current) => ({ ...current, tags: event.target.value }))}
                      placeholder="Tags separated by commas"
                    />
                  </div>
                  <label className="block rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                    <span className="font-medium text-slate-950">Upload template file</span>
                    <input
                      type="file"
                      accept=".txt,.md,.docx,.pdf"
                      className="mt-3 block w-full text-sm"
                      onChange={(event) => setPublishForm((current) => ({ ...current, template_file: event.target.files?.[0] || null }))}
                    />
                  </label>
                  <Textarea
                    value={publishForm.template_body}
                    onChange={(event) => setPublishForm((current) => ({ ...current, template_body: event.target.value }))}
                    placeholder="Paste the template text here if you are not uploading a file. Example: This agreement is executed on {{agreement_date}} between {{party_one_name}} and {{party_two_name}}."
                    rows={8}
                  />

                  <div className="space-y-3 rounded-[26px] border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">Fillable fields</p>
                        <p className="text-xs text-slate-500">These fields appear to the user before checkout.</p>
                      </div>
                      <Button type="button" variant="outline" className="rounded-full" onClick={() => setUploadFields((current) => [...current, emptyUploadField()])}>
                        Add field
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {uploadFields.map((field, index) => (
                        <div key={`${field.key}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Input
                              value={field.label}
                              onChange={(event) => updateUploadField(index, { label: event.target.value })}
                              placeholder="Field label"
                            />
                            <Input
                              value={field.key}
                              onChange={(event) => updateUploadField(index, { key: slugifyFieldKey(event.target.value) })}
                              placeholder="field_key"
                            />
                          </div>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <select
                              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
                              value={field.input_type}
                              onChange={(event) => updateUploadField(index, { input_type: event.target.value })}
                            >
                              <option value="text">Text</option>
                              <option value="textarea">Textarea</option>
                              <option value="date">Date</option>
                              <option value="number">Number</option>
                              <option value="email">Email</option>
                              <option value="phone">Phone</option>
                              <option value="select">Select</option>
                            </select>
                            <Input
                              value={field.placeholder}
                              onChange={(event) => updateUploadField(index, { placeholder: event.target.value })}
                              placeholder="Placeholder"
                            />
                          </div>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <Input
                              value={field.help_text}
                              onChange={(event) => updateUploadField(index, { help_text: event.target.value })}
                              placeholder="Help text (optional)"
                            />
                            <Input
                              value={field.options}
                              onChange={(event) => updateUploadField(index, { options: event.target.value })}
                              placeholder="Comma-separated options for select fields"
                            />
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-slate-600">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(event) => updateUploadField(index, { required: event.target.checked })}
                              />
                              Required field
                            </label>
                            {uploadFields.length > 1 ? (
                              <Button
                                type="button"
                                variant="ghost"
                                className="rounded-full text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                onClick={() => setUploadFields((current) => current.filter((_, fieldIndex) => fieldIndex !== index))}
                              >
                                Remove
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button type="button" className="w-full rounded-full" disabled={publishLoading} onClick={() => void handlePublishTemplate()}>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    {publishLoading ? "Publishing template..." : "Publish document template"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
