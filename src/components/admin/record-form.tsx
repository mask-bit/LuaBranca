import { deleteRecordAction, saveRecordAction } from "@/lib/admin-actions";
import { ContentBlockEditor } from "@/components/admin/content-block-editor";
import type { RecordItem, TagItem } from "@/lib/data";
import {
  confidenceOptions,
  labelize,
  moduleConfigs,
  riskOptions,
  secrecyOptions,
  statusOptions,
  type RecordKind,
} from "@/lib/modules";
import { metadataFields, type FieldDef } from "@/lib/record-fields";
import { slugify } from "@/lib/utils";

export function RecordForm({
  kind,
  record,
  allRecords,
  allTags,
  error,
  canDelete,
}: {
  kind: RecordKind;
  record?: RecordItem | null;
  allRecords: RecordItem[];
  allTags: TagItem[];
  error?: string | null;
  canDelete?: boolean;
}) {
  const saveAction = saveRecordAction.bind(null, kind, record?.id ?? null);
  const deleteAction = record ? deleteRecordAction.bind(null, kind, record.id) : null;
  const selectedTags = new Set((record?.tags ?? []).map((tag) => slugify(tag)));

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded border border-red-200/35 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>
      )}

      <form action={saveAction} encType="multipart/form-data" className="space-y-5">
        <Section title="Identificacao">
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="title" label="Titulo" required defaultValue={record?.title} />
            <Input name="slug" label="Slug" defaultValue={record?.slug} placeholder="gerado pelo titulo se vazio" />
            <Input name="category" label="Categoria" defaultValue={record?.category ?? undefined} />
            <Select name="status" label="Status" options={statusOptions} defaultValue={record?.status ?? "rascunho"} />
          </div>
          <Textarea name="summary" label="Resumo" defaultValue={record?.summary ?? undefined} />
          <Textarea name="description" label="Texto legado / fallback" defaultValue={record?.description ?? undefined} />
        </Section>

        <Section title="Conteudo em blocos">
          <ContentBlockEditor initialBlocks={record?.content_blocks ?? []} assets={record?.assets ?? []} />
        </Section>

        <Section title="Classificacao">
          <div className="grid gap-4 md:grid-cols-4">
            <Select name="risk" label="Risco" options={riskOptions} defaultValue={record?.risk ?? "baixo"} />
            <Select name="secrecy" label="Sigilo" options={secrecyOptions} defaultValue={record?.secrecy ?? "restrito"} />
            <Select name="confidence" label="Confiabilidade" options={confidenceOptions} defaultValue={record?.confidence ?? "media"} />
            <Input name="new_tags" label="Novas tags" placeholder="separe por virgula" />
          </div>
          <fieldset className="rounded border border-white/10 bg-black/20 p-3">
            <legend className="px-1 text-xs uppercase tracking-[0.16em] text-zinc-500">Tags existentes</legend>
            {allTags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <label
                    key={tag.id}
                    className="inline-flex h-9 cursor-pointer items-center gap-2 rounded border border-cyan-200/20 bg-cyan-200/10 px-3 text-xs text-cyan-50 transition hover:bg-cyan-200/15"
                  >
                    <input
                      type="checkbox"
                      name="tag_slugs"
                      value={tag.slug}
                      defaultChecked={selectedTags.has(tag.slug)}
                    />
                    {tag.name}
                    <span className="font-mono text-cyan-100/55">{tag.record_count}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-zinc-400">
                Nenhuma tag cadastrada. Use o campo de novas tags ou o gerenciador em /admin/tags.
              </p>
            )}
          </fieldset>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex min-h-12 items-center gap-3 rounded border border-white/10 bg-black/20 px-3 text-sm text-zinc-200">
              <input type="checkbox" name="is_published" defaultChecked={record?.is_published} />
              Publicar para leitura publica
            </label>
            <label className="flex min-h-12 items-center gap-3 rounded border border-white/10 bg-black/20 px-3 text-sm text-zinc-200">
              <input type="checkbox" name="is_featured" defaultChecked={record?.is_featured} />
              Marcar como destaque monitorado
            </label>
          </div>
        </Section>

        <Section title={`Campos de ${moduleConfigs[kind].title}`}>
          <div className="grid gap-4 md:grid-cols-2">
            {metadataFields[kind].map((field) => (
              <Field key={field.name} field={field} value={record?.metadata?.[field.name]} />
            ))}
          </div>
        </Section>

        <Section title="Visual e anexos">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="md:col-span-2">
              <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-500">Arquivos</span>
              <input
                name="assets"
                type="file"
                multiple
                className="block w-full rounded border border-white/10 bg-black/20 p-3 text-sm text-zinc-300 file:mr-3 file:rounded file:border-0 file:bg-cyan-200/15 file:px-3 file:py-2 file:text-cyan-50"
              />
            </label>
            <Select name="asset_visibility" label="Visibilidade" options={["public", "private"]} defaultValue="public" />
            <Select name="asset_type" label="Tipo de anexo" options={["image", "attachment"]} defaultValue="image" />
            <label className="flex min-h-12 items-center gap-3 rounded border border-white/10 bg-black/20 px-3 text-sm text-zinc-200 md:col-span-2">
              <input type="checkbox" name="use_first_upload_as_cover" defaultChecked={!record?.cover_asset_id} />
              Usar primeiro upload como imagem de capa
            </label>
          </div>
        </Section>

        <Section title="Ligacoes">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <label>
              <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-500">Registros relacionados</span>
              <select
                name="related_ids"
                multiple
                defaultValue={record?.relations.map((relation) => relation.record.id)}
                className="min-h-44 w-full rounded border border-white/10 bg-black/25 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-cyan-200/45"
              >
                {allRecords
                  .filter((item) => item.id !== record?.id)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {moduleConfigs[item.kind].title} - {item.title}
                    </option>
                  ))}
              </select>
            </label>
            <Input name="relation_type" label="Tipo de relacao" defaultValue="relacionado" />
          </div>
        </Section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button className="h-11 rounded border border-cyan-200/35 bg-cyan-200/12 px-5 text-sm font-semibold uppercase tracking-[0.14em] text-cyan-50 transition hover:bg-cyan-200/18">
            Salvar {moduleConfigs[kind].singular}
          </button>
          {record && canDelete && deleteAction && (
            <button
              formAction={deleteAction}
              className="h-11 rounded border border-red-200/35 bg-red-500/10 px-5 text-sm font-semibold uppercase tracking-[0.14em] text-red-100 transition hover:bg-red-500/15"
            >
              Apagar registro
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-white/10 bg-[#0d1822]/86 p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Input({
  name,
  label,
  defaultValue,
  placeholder,
  required,
  type = "text",
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? undefined}
        placeholder={placeholder}
        className="h-11 w-full rounded border border-white/10 bg-black/25 px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-cyan-200/45"
      />
    </label>
  );
}

function Textarea({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string | null }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</span>
      <textarea
        name={name}
        rows={5}
        defaultValue={defaultValue ?? undefined}
        className="w-full rounded border border-white/10 bg-black/25 px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-600 focus:border-cyan-200/45"
      />
    </label>
  );
}

function Select({
  name,
  label,
  options,
  defaultValue,
}: {
  name: string;
  label: string;
  options: readonly string[];
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="h-11 w-full rounded border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-cyan-200/45"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labelize(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function Field({ field, value }: { field: FieldDef; value: unknown }) {
  const name = `metadata.${field.name}`;
  const defaultValue = typeof value === "string" ? value : undefined;

  if (field.type === "textarea") {
    return <Textarea name={name} label={field.label} defaultValue={defaultValue} />;
  }

  if (field.type === "select" && field.options) {
    return <Select name={name} label={field.label} options={field.options} defaultValue={defaultValue} />;
  }

  return <Input name={name} label={field.label} defaultValue={defaultValue} type={field.type === "color" ? "color" : field.type === "date" ? "date" : "text"} />;
}
