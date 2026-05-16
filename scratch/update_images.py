import re
import os

def update_new():
    with open('src/app/(admin)/dashboard/products/new/page.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace state
    state_old = """  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])"""
    state_new = """  type ImageItem = { id: string; url: string; file: File };
  const [images, setImages] = useState<ImageItem[]>([])
  const [isDragOver, setIsDragOver] = useState(false)"""
    content = content.replace(state_old, state_new)

    # Replace handleFiles and removeFile
    handle_old = """  const handleFiles = (selected: FileList | null) => {
    if (!selected) return
    const arr = Array.from(selected)
    setFiles(prev => [...prev, ...arr])
    const newPreviews = arr.map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...newPreviews])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }"""
    handle_new = """  const handleFiles = (selected: FileList | null) => {
    if (!selected) return
    const newItems = Array.from(selected).map((f, i) => ({
      id: `new-${Date.now()}-${i}`,
      url: URL.createObjectURL(f),
      file: f
    }))
    setImages(prev => [...prev, ...newItems])
  }

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true) }
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false) }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false)
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString())
  }
  const handleDropSort = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'))
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return
    const newImages = [...images]
    const [moved] = newImages.splice(sourceIndex, 1)
    newImages.splice(targetIndex, 0, moved)
    setImages(newImages)
  }
  const handleDragOverSort = (e: React.DragEvent) => e.preventDefault()"""
    content = content.replace(handle_old, handle_new)

    # Replace uploadImages
    upload_old = """  const uploadImages = async (): Promise<string[]> => {
    setIsUploading(true)
    const urls: string[] = []
    try {
      for (const file of files) {
        const ext = file.name.split('.').pop()
        const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage.from('product-images').upload(path, file)
        if (!error) {
          const { data } = supabase.storage.from('product-images').getPublicUrl(path)
          urls.push(data.publicUrl)
        }
      }
    } finally {
      setIsUploading(false)
    }
    return urls
  }"""
    upload_new = """  const uploadImages = async (): Promise<string[]> => {
    setIsUploading(true)
    const urls: string[] = []
    try {
      for (const img of images) {
        const ext = img.file.name.split('.').pop()
        const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage.from('product-images').upload(path, img.file)
        if (!error) {
          const { data } = supabase.storage.from('product-images').getPublicUrl(path)
          urls.push(data.publicUrl)
        }
      }
    } finally {
      setIsUploading(false)
    }
    return urls
  }"""
    content = content.replace(upload_old, upload_new)

    # Replace `files.length`
    content = content.replace("files.length > 0", "images.length > 0")

    # Replace label and gallery
    ui_old = """              <label
                htmlFor="img-upload"
                className="block border-2 border-dashed border-indigo-100 rounded-xl p-10 text-center bg-indigo-50/30 hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                <UploadCloud className="mx-auto h-10 w-10 text-indigo-400 mb-3" />
                <p className="text-sm font-medium text-indigo-600">اضغط لرفع صور المنتج</p>
                <p className="text-xs text-slate-400 mt-2">يمكنك اختيار أكثر من صورة (JPG, PNG, WEBP)</p>
                <input id="img-upload" type="file" multiple accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
              </label>
              
              {previews.length > 0 && (
                <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {previews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="معاينة" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}"""
    ui_new = """              <label
                htmlFor="img-upload"
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`block border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${isDragOver ? 'border-indigo-500 bg-indigo-100' : 'border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50'}`}
              >
                <UploadCloud className="mx-auto h-10 w-10 text-indigo-400 mb-3" />
                <p className="text-sm font-medium text-indigo-600">اسحب الصور وأفلتها هنا، أو اضغط للرفع</p>
                <p className="text-xs text-slate-400 mt-2">يمكنك السحب والإفلات لترتيب الصور لاحقاً</p>
                <input id="img-upload" type="file" multiple accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
              </label>
              
              {images.length > 0 && (
                <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {images.map((img, i) => (
                    <div 
                      key={img.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, i)}
                      onDrop={(e) => handleDropSort(e, i)}
                      onDragOver={handleDragOverSort}
                      className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group shadow-sm cursor-grab active:cursor-grabbing"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="معاينة" className="w-full h-full object-cover pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1.5 left-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-1.5 right-1.5 bg-slate-900/60 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 backdrop-blur-sm pointer-events-none">
                        رقم {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}"""
    content = content.replace(ui_old, ui_new)

    with open('src/app/(admin)/dashboard/products/new/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

def update_edit():
    with open('src/app/(admin)/dashboard/products/[id]/edit/page.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace state
    state_old = """  const [files, setFiles] = useState<File[]>([]) 
  const [previews, setPreviews] = useState<string[]>([]) 
  const [existingImages, setExistingImages] = useState<string[]>([])"""
    state_new = """  type ImageItem = { id: string; type: 'existing' | 'new'; url: string; file?: File };
  const [images, setImages] = useState<ImageItem[]>([])
  const [isDragOver, setIsDragOver] = useState(false)"""
    content = content.replace(state_old, state_new)

    # Replace useEffect image setting
    effect_old = """        if (product.images) {
          setExistingImages(product.images)
        }"""
    effect_new = """        if (product.images) {
          setImages(product.images.map((url: string, i: number) => ({
            id: `existing-${Date.now()}-${i}`,
            type: 'existing',
            url
          })))
        }"""
    content = content.replace(effect_old, effect_new)

    # Replace handleFiles and remove handlers
    handle_old = """  const handleFiles = (selected: FileList | null) => {
    if (!selected) return
    const arr = Array.from(selected)
    setFiles(prev => [...prev, ...arr])
    const newPreviews = arr.map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...newPreviews])
  }

  const removeNewFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async (): Promise<string[]> => {
    setIsUploading(true)
    const urls: string[] = []
    try {
      for (const file of files) {
        const ext = file.name.split('.').pop()
        const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage.from('product-images').upload(path, file)
        if (!error) {
          const { data } = supabase.storage.from('product-images').getPublicUrl(path)
          urls.push(data.publicUrl)
        }
      }
    } finally {
      setIsUploading(false)
    }
    return urls
  }

  const onSubmit = async (values: FormValues) => {
    setServerError('')
    try {
      let newImageUrls: string[] = []
      if (files.length > 0) {
        newImageUrls = await uploadImages()
      }
      
      const allImages = [...existingImages, ...newImageUrls]"""
    handle_new = """  const handleFiles = (selected: FileList | null) => {
    if (!selected) return
    const newItems = Array.from(selected).map((f, i) => ({
      id: `new-${Date.now()}-${i}`,
      type: 'new' as const,
      url: URL.createObjectURL(f),
      file: f
    }))
    setImages(prev => [...prev, ...newItems])
  }

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true) }
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false) }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false)
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString())
  }
  const handleDropSort = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'))
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return
    const newImages = [...images]
    const [moved] = newImages.splice(sourceIndex, 1)
    newImages.splice(targetIndex, 0, moved)
    setImages(newImages)
  }
  const handleDragOverSort = (e: React.DragEvent) => e.preventDefault()

  const onSubmit = async (values: FormValues) => {
    setServerError('')
    try {
      setIsUploading(true)
      const allImages: string[] = []
      
      for (const img of images) {
        if (img.type === 'existing') {
          allImages.push(img.url)
        } else if (img.type === 'new' && img.file) {
          const ext = img.file.name.split('.').pop()
          const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
          const { error } = await supabase.storage.from('product-images').upload(path, img.file)
          if (!error) {
            const { data } = supabase.storage.from('product-images').getPublicUrl(path)
            allImages.push(data.publicUrl)
          }
        }
      }
      setIsUploading(false)"""
    content = content.replace(handle_old, handle_new)

    # Replace UI
    ui_old = """              <label
                htmlFor="img-upload"
                className="block border-2 border-dashed border-indigo-100 rounded-xl p-10 text-center bg-indigo-50/30 hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                <UploadCloud className="mx-auto h-10 w-10 text-indigo-400 mb-3" />
                <p className="text-sm font-medium text-indigo-600">اضغط لرفع صور إضافية</p>
                <p className="text-xs text-slate-400 mt-2">يمكنك اختيار أكثر من صورة (JPG, PNG, WEBP)</p>
                <input id="img-upload" type="file" multiple accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
              </label>
              
              {(existingImages.length > 0 || previews.length > 0) && (
                <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {existingImages.map((src, i) => (
                    <div key={`existing-${i}`} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="صورة حالية" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {previews.map((src, i) => (
                    <div key={`new-${i}`} className="relative aspect-square rounded-xl overflow-hidden border border-indigo-400 group shadow-sm">
                      <div className="absolute top-1 right-1 bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded z-10">جديد</div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="معاينة" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewFile(i)}
                        className="absolute top-1.5 left-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}"""
    ui_new = """              <label
                htmlFor="img-upload"
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`block border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${isDragOver ? 'border-indigo-500 bg-indigo-100' : 'border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50'}`}
              >
                <UploadCloud className="mx-auto h-10 w-10 text-indigo-400 mb-3" />
                <p className="text-sm font-medium text-indigo-600">اسحب الصور وأفلتها هنا، أو اضغط للرفع</p>
                <p className="text-xs text-slate-400 mt-2">يمكنك السحب والإفلات لترتيب الصور لاحقاً</p>
                <input id="img-upload" type="file" multiple accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
              </label>
              
              {images.length > 0 && (
                <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {images.map((img, i) => (
                    <div 
                      key={img.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, i)}
                      onDrop={(e) => handleDropSort(e, i)}
                      onDragOver={handleDragOverSort}
                      className={`relative aspect-square rounded-xl overflow-hidden border group shadow-sm cursor-grab active:cursor-grabbing ${img.type === 'new' ? 'border-indigo-400' : 'border-slate-200'}`}
                    >
                      {img.type === 'new' && <div className="absolute top-1 right-1 bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded z-10 pointer-events-none">جديد</div>}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="صورة" className="w-full h-full object-cover pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className={`absolute top-1.5 ${img.type === 'new' ? 'left-1.5' : 'right-1.5'} w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-1.5 right-1.5 bg-slate-900/60 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 backdrop-blur-sm pointer-events-none">
                        رقم {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}"""
    content = content.replace(ui_old, ui_new)

    with open('src/app/(admin)/dashboard/products/[id]/edit/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

try:
    update_new()
    print("updated new/page.tsx")
except Exception as e:
    print("error new/page.tsx", e)

try:
    update_edit()
    print("updated edit/page.tsx")
except Exception as e:
    print("error edit/page.tsx", e)
