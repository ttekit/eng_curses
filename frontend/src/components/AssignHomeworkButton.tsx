import { useState, useEffect } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch, getResponseErrorMessage } from "../lib/api";
import { cn } from "../lib/utils";
import { AdminButton, AdminModal, AdminInput } from "./admin/adminUi";

export function AssignHomeworkButton({
  contentId,
  contentName,
}: {
  contentId: number;
  contentName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<
    Record<number, { availableFrom: string; deadline: string }>
  >({});

  useEffect(() => {
    if (isOpen && classes.length === 0) {
      setLoadingClasses(true);
      apiFetch("/teacher/classes", { method: "GET" })
        .then((res) => res.json())
        .then((data) => setClasses(Array.isArray(data) ? data : []))
        .catch(() => toast.error("Failed to load classes"))
        .finally(() => setLoadingClasses(false));
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (Object.keys(selectedClasses).length === 0) {
      return toast.error("Please select at least one class");
    }

    setIsSaving(true);
    try {
      const assignments = Object.entries(selectedClasses).map(
        ([cId, data]) => ({
          classId: Number(cId),
          availableFrom: data.availableFrom
            ? new Date(data.availableFrom).toISOString()
            : undefined,
          deadline: data.deadline
            ? new Date(data.deadline).toISOString()
            : undefined,
        }),
      );

      const res = await apiFetch(`/contents/teacher/assign/${contentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classAssignments: assignments }),
      });

      if (!res.ok) throw new Error(await getResponseErrorMessage(res));

      toast.success("Homework assigned successfully!");
      setIsOpen(false);
      setSelectedClasses({});
    } catch (e: any) {
      toast.error(e.message || "Failed to assign homework");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        if (!isSaving) setIsOpen(false);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (!isSaving) void handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSaving, selectedClasses]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors border border-primary/20"
        title="Assign Homework"
      >
        <BookOpen className="size-3.5" />
        Assign Homework
      </button>

      <AdminModal
        open={isOpen}
        onClose={() => !isSaving && setIsOpen(false)}
        title="Assign as Homework"
        footer={
          <>
            <AdminButton
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </AdminButton>
            <AdminButton onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Assign"}
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select the classes you want to assign the lesson{" "}
            <span className="font-bold text-foreground">"{contentName}"</span>{" "}
            to, and set the deadlines.
          </p>

          {loadingClasses ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="size-4 animate-spin" /> Loading classes...
            </div>
          ) : classes.length === 0 ? (
            <div className="bg-muted p-4 rounded-lg text-sm text-center">
              You don't have any classes yet. Create one in the "Students" tab.
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {classes.map((cls) => {
                const isSelected = !!selectedClasses[cls.id];
                const data = selectedClasses[cls.id] || {
                  availableFrom: "",
                  deadline: "",
                };
                return (
                  <div
                    key={cls.id}
                    className={cn(
                      "border border-border/70 rounded-lg p-3 space-y-3 transition-colors",
                      isSelected
                        ? "bg-primary/5 border-primary/30"
                        : "bg-background",
                    )}
                  >
                    <label className="flex items-center gap-3 font-semibold cursor-pointer text-sm select-none">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClasses((p) => ({
                              ...p,
                              [cls.id]: { availableFrom: "", deadline: "" },
                            }));
                          } else {
                            const next = { ...selectedClasses };
                            delete next[cls.id];
                            setSelectedClasses(next);
                          }
                        }}
                        className="rounded border-border text-primary focus:ring-primary size-4.5 cursor-pointer"
                      />
                      {cls.name}
                    </label>

                    {isSelected && (
                      <div className="flex flex-col gap-4 pl-8 pt-1 animate-in fade-in zoom-in-95">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">
                            Available from (optional)
                          </label>
                          <AdminInput
                            type="datetime-local"
                            value={data.availableFrom}
                            className="w-full"
                            onChange={(e) =>
                              setSelectedClasses((p) => ({
                                ...p,
                                [cls.id]: {
                                  ...p[cls.id],
                                  availableFrom: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">
                            Deadline (optional)
                          </label>
                          <AdminInput
                            type="datetime-local"
                            value={data.deadline}
                            className="w-full"
                            onChange={(e) =>
                              setSelectedClasses((p) => ({
                                ...p,
                                [cls.id]: {
                                  ...p[cls.id],
                                  deadline: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AdminModal>
    </>
  );
}
