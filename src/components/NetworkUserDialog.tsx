import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PersonApi from '@/js/clients/base/PersonApi';
import PersonCreateModel from '@/js/models/Person';
import type Person from '@/js/models/Person';
import Region from '@/js/models/Region';
import { type PersonType } from '@/js/models/enum/PersonTypeEnum';
import { Pause, Play, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { useTranslation } from 'react-i18next';
import { useDialogWithConfirm } from '@/hooks/use-dialog-with-confirm';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import PersonEditStatusRequest from '@/js/models/PersonEditStatusRequest';

const formSchema = z.object({
  firstName: z.string().min(1, 'user.form.firstName.required'),
  lastName: z.string().min(1, 'user.form.lastName.required'),
  email: z.string().email('user.form.email.invalid'),
  role: z
    .enum(['ProgramAdministrator', 'Csr', 'FieldStaff'])
    .optional()
    .refine((val) => val !== undefined, {
      message: 'user.form.role.required',
    }),
  csrRegion: z.object({ id: z.number(), name: z.string() }).optional(),
  fieldStaffRegions: z.array(z.object({ id: z.number(), name: z.string() })).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NetworkUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Person | null;
  filterByRegion?: { id: number; name: string } | null;
  onSuccess?: (data: FormValues) => void;
  onError?: (error: Error) => void;
}

export default function NetworkUserDialog({
  open,
  onOpenChange,
  initialValues,
  onSuccess,
  onError,
}: NetworkUserDialogProps) {
  const { t } = useTranslation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: undefined,
      csrRegion: undefined,
      fieldStaffRegions: [],
    },
  });

  const regions = useAuthStore((state) => state.auth.user?.regions || []);

  useEffect(() => {
    if (initialValues && open) {
      form.reset({
        firstName: initialValues.firstName || '',
        lastName: initialValues.lastName || '',
        email: initialValues.email || '',
        role: initialValues.type as 'ProgramAdministrator' | 'Csr' | 'FieldStaff' | undefined,
        csrRegion: initialValues.csrRegion,
        fieldStaffRegions: initialValues.fieldStaffRegions,
      });
      setPreviousRole(initialValues.type as 'ProgramAdministrator' | 'Csr' | 'FieldStaff' | undefined);
    } else if (!initialValues && open) {
      // ✅ If none initialValues，Reset to default value
      form.reset({
        firstName: '',
        lastName: '',
        email: '',
        role: undefined,
        csrRegion: undefined,
        fieldStaffRegions: [],
      });
      setPreviousRole(undefined);
    }
  }, [initialValues, open, form]);

  // Use useWatch Replace form.watch()
  const selectedRole = useWatch({
    control: form.control,
    name: 'role',
  });
  
  // Track previous role to detect actual role changes
  const [previousRole, setPreviousRole] = useState<typeof selectedRole>(undefined);

  const showRegionSelector = selectedRole === 'FieldStaff';
  const showCsrRegionSelector = selectedRole === 'Csr';

  const { ConfirmDialogComponent } = useDialogWithConfirm({
    form,
    onClose: () => {
      form.reset();
      onOpenChange(false);
    },
    title: t('common.discardTitle'),
    description: t('common.discardDescription'),
  });

  const handleDeactivate = async (id: number) => {
    try {
      return await new Promise((resolve, reject) => {
        const request = PersonEditStatusRequest.create({
          personId: id,
          action: 'Deactivate',
        });
        const personApi = new PersonApi();
        personApi.editStatus(request, {
          status200: () => {
            resolve(true);
          },
          error: (error) => {
            reject(error);
          },
          else: (_statusCode, message) => {
            reject(new Error(message));
          },
        });
      });
    } catch (error) {
      toast.error(t('team.dialog.deactivateFailed'));
      console.error(error);
    }
  };

  const handleReactivate = async (id: number) => {
    try {
      return await new Promise((resolve, reject) => {
        const request = PersonEditStatusRequest.create({
          personId: id,
          action: 'Reactivate',
        });
        const personApi = new PersonApi();
        personApi.editStatus(request, {
          status200: () => {
            resolve(true);
          },
          error: (error) => {
            reject(error);
          },
          else: (_statusCode, message) => {
            reject(new Error(message));
          },
        });
      });
    } catch (error) {
      toast.error(t('team.dialog.reactivateFailed'));
      console.error(error);
    }
  };
  const renderActionButtons = (member: any) => {
    switch (member?.status) {
      case 'Active':
        return (
          <Button size="sm" variant="outline" onClick={() => handleDeactivate(member.id)}>
            <Pause className="mr-1 h-3.5 w-3.5" /> {t('team.button.deactivate')}
          </Button>
        );
      case 'Inactive':
        return (
          <Button size="sm" variant="outline" onClick={() => handleReactivate(member.id)}>
            <Play className="mr-1 h-3.5 w-3.5" /> {t('team.button.reactivate')}
          </Button>
        );
      default:
        return null;
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const request = PersonCreateModel.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        type: data.role as PersonType,
        id: initialValues?.id || undefined, // ✅ Edit mode requires id，Creation mode is undefined
        csrRegion: data.csrRegion ? Region.create({ id: data.csrRegion.id, name: data.csrRegion.name }) : undefined,
        fieldStaffRegions: data.fieldStaffRegions ? Region.createArray(data.fieldStaffRegions) : [],

        // fieldStaffRegions: data.fieldStaffRegions ? data.fieldStaffRegions.map((r) => Region.create(r)) : [],
      });

      const personApi = new PersonApi();

      await new Promise((resolve) => {
        // ✅ Fix：Call separately，Do not use await（Because these methods return void）
        if (initialValues) {
          personApi.edit(request, {
            status200: (response) => {
              onSuccess?.(response);
              toast.success(t('user.toast.updateSuccess'));
              onOpenChange(false);
              form.reset();
              resolve(true);
            },
            error: (error) => {
              onError?.(error);
              resolve(false);
            },
            else: (_statusCode: number, responseText: string) => {
              toast.error(responseText);
              resolve(false);
            },
          });
        } else {
          personApi.createNetworkUser(request, {
            status200: (response) => {
              onSuccess?.(response);
              toast.success(t('user.toast.createSuccess'));
              onOpenChange(false);
              form.reset();
              resolve(true);
            },
            error: (error) => {
              onError?.(error);
              resolve(false);
            },
            else: () => {
              resolve(false);
            },
          });
        }
      });
    } catch (error: unknown) {
      onError?.(error as Error);
      throw error;
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // handleCloseRequest();
      form.reset();
      onOpenChange(false);
    } else {
      onOpenChange(true);
    }
  };

  // When switching roles，Clear regions Field
  useEffect(() => {
    // Only clear when role actually changes to a different value
    if (selectedRole && selectedRole !== previousRole) {
      if (selectedRole !== 'Csr') {
      form.setValue('csrRegion', undefined);
      }
      if (selectedRole !== 'FieldStaff') {
      form.setValue('fieldStaffRegions', []);
      }
      setPreviousRole(selectedRole);
    }
  }, [selectedRole, previousRole, form]);

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className=" sm:max-w-2xl">
          {/* Fixed header - Unified style */}
          <DialogHeader className="shrink-0">
            <DialogTitle className="py-2 text-2xl font-semibold ">
              {initialValues ? t('user.dialog.editTitle') : t('user.dialog.addTitle')}
            </DialogTitle>
            <Separator />
            <button
              onClick={() => handleOpenChange(false)}
              className="absolute transition-opacity rounded-sm ring-offset-background focus:ring-ring top-4 right-4 opacity-70 hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">{t('common.close')}</span>
            </button>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('user.form.firstName.label')}</FormLabel>
                      <FormControl>
                        <Input  {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('user.form.lastName.label')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('user.form.email.label')}</FormLabel>
                    <FormControl>
                      <Input type="email"  {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('user.form.role.label')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue placeholder={t('user.form.role.placeholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ProgramAdministrator">{t('user.role.admin')}</SelectItem>
                        <SelectItem value="Csr">{t('user.role.csr')}</SelectItem>
                        <SelectItem value="FieldStaff">{t('user.role.fieldStaff')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {showRegionSelector && (
                <div className="space-y-3">
                  <Label>{t('user.form.fieldStaffRegions.label')}</Label>
                  <div className="p-4 space-y-3 border rounded-md bg-muted">
                    {regions.map((region) => (
                      <FormField
                        key={region.id}
                        control={form.control}
                        name="fieldStaffRegions"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.some((r: Region) => r.id === region.id)}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...(field.value || []), { id: region.id, name: region.name }]
                                    : (field.value || []).filter(
                                        (r: { id: number; name: string }) => r.id !== region.id
                                      );
                                  field.onChange(newValue);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">{region.name}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}
              {showCsrRegionSelector && (
                <div className="space-y-3">
                  <Label>{t('user.form.csrRegion.label')}</Label>
                  <div className="p-4 space-y-3 border rounded-md bg-muted">
                    <FormField
                      control={form.control}
                      name="csrRegion"
                      render={({ field }) => (
                        <RadioGroup
                          value={field.value?.id?.toString() || ''}
                          onValueChange={(value) => {
                            const selectedRegion = regions.find((r) => r.id?.toString() === value);
                            field.onChange(
                              selectedRegion
                                ? {
                                    id: selectedRegion.id,
                                    name: selectedRegion.name,
                                  }
                                : undefined
                            );
                          }}
                        >
                          {regions.map((region) => (
                            <FormItem key={region.id} className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={region.id?.toString() || ''} id={region.id?.toString() || ''} />
                              </FormControl>
                              <FormLabel htmlFor={region.id?.toString() || ''} className="font-normal cursor-pointer">
                                {region.name}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      )}
                    />
                  </div>
                </div>
              )}
              <DialogFooter className="flex justify-between w-full pt-4 mt-4">
                <div className="flex-1">{renderActionButtons(initialValues)}</div>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" variant="default" disabled={form.formState.isSubmitting}>
                    {initialValues
                      ? form.formState.isSubmitting
                        ? t('common.updating')
                        : t('common.update')
                      : form.formState.isSubmitting
                        ? t('common.creating')
                        : t('common.create')}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {ConfirmDialogComponent} {/* Add this row */}
    </>
  );
}
