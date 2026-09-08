import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudioPage } from "@/components/studio/page-header";
import { getSettings } from "@/lib/settings";
import { findGroup } from "@/lib/studio/settings-fields";
import { updateSettingsGroup } from "../actions";
import { SettingsGroupForm } from "../settings-group-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ group: string }>;
}): Promise<Metadata> {
  const { group: groupId } = await params;
  const group = findGroup(groupId);
  return { title: group?.label ?? "Site content" };
}

export default async function SettingsGroupPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group: groupId } = await params;
  const group = findGroup(groupId);
  if (!group) notFound();

  const settings = await getSettings();

  return (
    <StudioPage>
      <h1 className="font-display text-3xl tracking-tight text-ink">
        {group.label}
      </h1>
      {group.description && (
        <p className="mt-2 max-w-xl text-base text-muted">
          {group.description}
        </p>
      )}

      <div className="mt-8">
        <SettingsGroupForm
          group={group}
          settings={settings}
          // bind() partially applies groupId, giving useActionState the
          // (prevState, formData) shape it expects from a single action
          // that otherwise serves every group.
          action={updateSettingsGroup.bind(null, group.id)}
        />
      </div>
    </StudioPage>
  );
}
