import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { updatePublisherProfileById, getPublisherByUsername } from "@/api/publisher";

const schema = z.object({
  studioName: z.string().min(2, "Tên studio tối thiểu 2 ký tự"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  phone: z.string().regex(/^[0-9]{9,12}$/, "Số điện thoại 9–12 chữ số").optional().or(z.literal("")),
  website: z.string().url("Website không hợp lệ").optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});

export default function PublisherProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("/placeholder.svg?height=200&width=200");
  const fileRef = useRef(null);
  const publisherIdRef = useRef(null); // dùng khi gọi API update

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { studioName: "", email: "", phone: "", website: "", description: "" },
  });

  // Lấy sẵn dữ liệu từ localStorage để đổ lên giao diện
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const stored = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
        // user mẫu bạn gửi có: username, role, email, phone, studioName, description, website, publisherId
        const username = stored.username;
        const fromStore = {
          studioName: stored.studioName || "",
          email: stored.email || "",
          phone: stored.phone || "",
          website: stored.website || "",
          description: stored.description || "",
          avatarUrl: stored.avatarUrl || stored.avatar,
          publisherId: stored.publisherId, // nếu đã lưu
        };

        // Nếu local chưa có publisherId, gọi API by-username để lấy id/publisherId
        if (!fromStore.publisherId && username) {
          try {
            const prof = await getPublisherByUsername(username);
            const data = prof?.data || prof;
            publisherIdRef.current = data?.publisherId ?? data?.id ?? null;
            // merge thêm vào local để lần sau có sẵn
            localStorage.setItem("user", JSON.stringify({ ...stored, publisherId: publisherIdRef.current }));
            // phủ thêm field nếu backend trả về
            fromStore.studioName = data?.studioName ?? fromStore.studioName;
            fromStore.email = data?.email ?? fromStore.email;
            fromStore.phone = data?.phone ?? fromStore.phone;
            fromStore.website = data?.website ?? fromStore.website;
            fromStore.description = data?.description ?? fromStore.description;
            fromStore.avatarUrl = data?.avatarUrl ?? fromStore.avatarUrl;
          } catch { /* ignore */ }
        } else {
          publisherIdRef.current = fromStore.publisherId ?? null;
        }

        form.reset({
          studioName: fromStore.studioName,
          email: fromStore.email,
          phone: fromStore.phone,
          website: fromStore.website,
          description: fromStore.description,
        });

        if (fromStore.avatarUrl) setAvatarUrl(fromStore.avatarUrl);
        else if (fromStore.studioName) {
          setAvatarUrl(
            `https://ui-avatars.com/api/?name=${encodeURIComponent(fromStore.studioName)}&background=9333ea&color=fff&size=200`
          );
        }
      } catch (e) {
        console.error(e);
        toast.error("Không thể tải hồ sơ publisher");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [form]);

  const onPickAvatar = () => fileRef.current?.click();
  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const rd = new FileReader();
    rd.onload = (ev) => setAvatarUrl(ev.target.result);
    rd.readAsDataURL(file);
  };

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      if (!publisherIdRef.current) {
        toast.error("Thiếu publisherId. Vui lòng tải lại trang hoặc đăng nhập lại.");
        return;
      }

      const payload = {
        studioName: values.studioName.trim(),
        email: values.email || null,
        phone: values.phone || null,
        website: values.website || null,
        description: values.description || null,
        avatarUrl: avatarUrl?.includes("placeholder") ? null : avatarUrl,
      };

      const res = await updatePublisherProfileById(publisherIdRef.current, payload);
      const data = res?.data || res || payload;

      // Lưu lại local cho lần sau
      const curr = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...curr,
        publisherId: publisherIdRef.current,
        studioName: data.studioName ?? payload.studioName,
        email: data.email ?? payload.email,
        phone: data.phone ?? payload.phone,
        website: data.website ?? payload.website,
        description: data.description ?? payload.description,
        avatarUrl: data.avatarUrl ?? payload.avatarUrl,
      }));

      toast.success("Đã lưu hồ sơ publisher");
    } catch (e) {
      console.error(e);
      toast.error("Cập nhật thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Card className="bg-purple-950/60 border border-purple-700 rounded-2xl p-16">
          <div className="animate-pulse h-6 w-40 bg-purple-800/50 mx-auto rounded"></div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card className="bg-purple-950/60 backdrop-blur-xl border border-purple-700 shadow-[0_0_30px_rgba(168,85,247,0.4)] rounded-2xl overflow-hidden">
        <CardContent className="p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white">Hồ sơ Nhà phát hành</h2>
            <p className="text-purple-300">Quản lý thông tin studio</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center md:shrink-0">
              <div className="relative mb-4">
                <Avatar className="h-32 w-32 border-4 border-purple-500/30">
                  <AvatarImage src={avatarUrl} alt="Studio" />
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-2xl">
                    {form.watch("studioName")?.charAt(0)?.toUpperCase() || "S"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                  onClick={onPickAvatar}
                >
                  <Camera className="h-5 w-5" />
                </Button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
              </div>
              <p className="text-purple-300 text-sm text-center max-w-[220px]">
                Nhấp máy ảnh để chọn logo/studio avatar (chưa upload server).
              </p>
            </div>

            <div className="flex-1">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField name="studioName" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-200">Tên studio</FormLabel>
                      <FormControl><Input {...field} className="bg-purple-900/40 border-purple-600 text-white" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField name="email" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-purple-200">Email</FormLabel>
                        <FormControl><Input {...field} placeholder="studio@example.com" className="bg-purple-900/40 border-purple-600 text-white" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="phone" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-purple-200">Số điện thoại</FormLabel>
                        <FormControl><Input {...field} placeholder="0999888777" className="bg-purple-900/40 border-purple-600 text-white" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField name="website" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-200">Website</FormLabel>
                      <FormControl><Input {...field} placeholder="https://example.com" className="bg-purple-900/40 border-purple-600 text-white" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField name="description" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-200">Mô tả</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} className="bg-purple-900/40 border-purple-600 text-white resize-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                    {isSubmitting ? "Đang lưu..." : (<><Save className="h-4 w-4 mr-2" />Lưu thông tin</>)}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
