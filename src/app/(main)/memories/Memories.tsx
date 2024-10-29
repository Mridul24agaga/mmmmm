"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { v4 as uuidv4 } from 'uuid';
import { Grid, Card, CardMedia, Box, IconButton, Modal, Avatar, TextField, Button, Typography, Tooltip, Menu, MenuItem, Slider, Popover } from '@mui/material';
import { styled } from '@mui/material/styles';
import { X, Heart, MessageCircle, Send, Bookmark, Image as ImageIcon, Link, MapPin, Smile, Grid as GridIcon, Download, LayoutTemplate, Move, ZoomIn, ZoomOut, RotateCw, Edit3, Palette } from 'lucide-react';
import html2canvas from 'html2canvas';

interface Photo {
  id: string;
  url: string;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  scale: number;
  x: number;
  y: number;
}

interface Post {
  id: string;
  type: 'photo' | 'collage';
  content: Photo | Photo[];
  created_at: string;
  memoryText: string;
  layout?: string;
  filter?: string;
}

const PhotoCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  aspectRatio: '1 / 1',
  cursor: 'pointer',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const ModalContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 1000,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[24],
  borderRadius: theme.spacing(2),
  outline: 'none',
  padding: theme.spacing(4),
}));

const ShareMemoryBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[200],
  borderRadius: '50px',
  marginBottom: theme.spacing(3),
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto',
}));

const MemoryInput = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'white',
  borderRadius: '20px',
  padding: theme.spacing(1.5),
  boxShadow: 'none',
}));

const IconsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(1),
}));

const CollageImage = styled('img')({
  objectFit: 'cover',
  position: 'absolute',
  transition: 'all 0.3s ease',
});

const CollageContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 600,
  aspectRatio: '1 / 1',
  position: 'relative',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[5],
  overflow: 'hidden',
}));

const MemoryTextOverlay = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(2),
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  color: 'white',
  maxHeight: '30%',
  overflowY: 'auto',
}));

const CollageToolbar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const filters = {
  none: '',
  sepia: 'sepia(100%)',
  grayscale: 'grayscale(100%)',
  invert: 'invert(100%)',
  blur: 'blur(5px)',
  brightness: 'brightness(150%)',
  contrast: 'contrast(200%)',
};

const layouts = {
  grid: (images: Photo[]) => {
    const rows = Math.ceil(Math.sqrt(images.length));
    const cols = Math.ceil(images.length / rows);
    const cellWidth = 100 / cols;
    const cellHeight = 100 / rows;
    return images.map((img, index) => ({
      ...img,
      x: (index % cols) * cellWidth,
      y: Math.floor(index / cols) * cellHeight,
      width: cellWidth,
      height: cellHeight,
      scale: 1,
      rotation: 0,
    }));
  },
  masonry: (images: Photo[]) => {
    const cols = 3;
    const columnHeights = new Array(cols).fill(0);
    const cellWidth = 100 / cols;
    return images.map((img, index) => {
      const col = columnHeights.indexOf(Math.min(...columnHeights));
      const x = col * cellWidth;
      const y = columnHeights[col];
      const aspectRatio = img.width / img.height;
      const height = cellWidth / aspectRatio;
      columnHeights[col] += height;
      return { ...img, x, y, width: cellWidth, height, scale: 1, rotation: 0 };
    });
  },
  spiral: (images: Photo[]) => {
    const centerX = 50;
    const centerY = 50;
    const spiralWidth = 40;
    const spiralHeight = 40;
    return images.map((img, index) => {
      const angle = index * 0.5 * Math.PI;
      const radius = 5 + index * 2;
      const x = centerX + (radius * Math.cos(angle) * spiralWidth) / 100;
      const y = centerY + (radius * Math.sin(angle) * spiralHeight) / 100;
      const size = 20 - index;
      return { ...img, x, y, width: size, height: size, scale: 1, rotation: angle * (180 / Math.PI) };
    });
  },
  polaroid: (images: Photo[]) => {
    return images.map((img, index) => {
      const angle = (Math.random() - 0.5) * 30;
      const x = 10 + Math.random() * 80;
      const y = 10 + Math.random() * 80;
      return { ...img, x, y, width: 30, height: 36, scale: 1, rotation: angle };
    });
  },
};

export default function EnhancedMemoriesPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [memoryText, setMemoryText] = useState('');
  const [collageImages, setCollageImages] = useState<Photo[]>([]);
  const [showCollagePreview, setShowCollagePreview] = useState(false);
  const [currentLayout, setCurrentLayout] = useState<keyof typeof layouts>('grid');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedImage, setSelectedImage] = useState<Photo | null>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [currentFilter, setCurrentFilter] = useState<string>('none');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const collageFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedPosts = localStorage.getItem('posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('posts', JSON.stringify(posts));
  }, [posts]);

  const openModal = (post: Post) => {
    setSelectedPost(post);
  };

  const closeModal = () => {
    setSelectedPost(null);
  };

  const handleShareMemory = () => {
    if (memoryText.trim()) {
      const newPost: Post = {
        id: uuidv4(),
        type: 'photo',
        content: { id: uuidv4(), url: '/placeholder.svg', width: 400, height: 400, rotation: 0, zIndex: 1, scale: 1, x: 0, y: 0 },
        created_at: new Date().toISOString(),
        memoryText: memoryText.trim(),
      };

      setPosts(prevPosts => {
        const updatedPosts = [newPost, ...prevPosts];
        localStorage.setItem('posts', JSON.stringify(updatedPosts));
        return updatedPosts;
      });
      setMemoryText('');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && memoryText.trim()) {
      Array.from(event.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const newPhoto: Photo = {
              id: uuidv4(),
              url: e.target?.result as string,
              width: img.width,
              height: img.height,
              rotation: 0,
              zIndex: 1,
              scale: 1,
              x: 0,
              y: 0,
            };
            const newPost: Post = {
              id: uuidv4(),
              type: 'photo',
              content: newPhoto,
              created_at: new Date().toISOString(),
              memoryText: memoryText.trim(),
            };
            setPosts(prevPosts => {
              const updatedPosts = [newPost, ...prevPosts];
              localStorage.setItem('posts', JSON.stringify(updatedPosts));
              return updatedPosts;
            });
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
      setMemoryText('');
    }
  };

  const handleCollageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && memoryText.trim()) {
      const newPhotos: Photo[] = [];
      Array.from(event.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            newPhotos.push({
              id: uuidv4(),
              url: e.target?.result as string,
              width: img.width,
              height: img.height,
              rotation: 0,
              zIndex: newPhotos.length + 1,
              scale: 1,
              x: 0,
              y: 0,
            });
            if (newPhotos.length === event.target!.files!.length) {
              setCollageImages(prevImages => layouts[currentLayout]([...prevImages, ...newPhotos].slice(0, 10)));
              setShowCollagePreview(true);
            }
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const triggerFileInput = () => {
    if (memoryText.trim()) {
      fileInputRef.current?.click();
    } else {
      alert("Please write about your memory before adding photos.");
    }
  };

  const triggerCollageFileInput = () => {
    if (memoryText.trim()) {
      collageFileInputRef.current?.click();
    } else {
      alert("Please write about your memory before creating a collage.");
    }
  };

  const renderCollage = (images: Photo[], text: string, filter: string = 'none') => {
    return (
      <CollageContainer>
        {images.map((image) => (
          <CollageImage
            key={image.id}
            src={image.url}
            alt={`Collage image`}
            style={{
              left: `${image.x}%`,
              top: `${image.y}%`,
              width: `${image.width}%`,
              height: `${image.height}%`,
              transform: `rotate(${image.rotation}deg) scale(${image.scale})`,
              zIndex: image.zIndex,
              filter: filters[filter as keyof typeof filters],
            }}
            onClick={() => setSelectedImage(image)}
          />
        ))}
        <MemoryTextOverlay variant="body2">{text}</MemoryTextOverlay>
      </CollageContainer>
    );
  };

  const handlePostCollage = () => {
    if (collageImages.length > 0 && memoryText.trim()) {
      const newPost: Post = {
        id: uuidv4(),
        type: 'collage',
        content: collageImages,
        created_at: new Date().toISOString(),
        memoryText: memoryText.trim(),
        layout: currentLayout,
        filter: currentFilter,
      };

      setPosts(prevPosts => {
        const updatedPosts = [newPost, ...prevPosts];
        localStorage.setItem('posts', JSON.stringify(updatedPosts));
        return updatedPosts;
      });
      setCollageImages([]);
      setShowCollagePreview(false);
      setMemoryText('');
      setCurrentFilter('none');
    }
  };

  const handleLayoutChange = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLayoutSelect = (layout: keyof typeof layouts) => {
    setCurrentLayout(layout);
    setCollageImages(prevImages => layouts[layout](prevImages));
    setAnchorEl(null);
  };

  const downloadCollage = (post: Post) => {
    const collageElement = document.createElement('div');
    collageElement.style.width = '600px';
    collageElement.style.height = '600px';
    collageElement.style.position = 'absolute';
    collageElement.style.left = '-9999px';
    document.body.appendChild(collageElement);

    const content = post.content as Photo[];
    const filter = post.filter || 'none';

    const root = createRoot(collageElement);
    root.render(renderCollage(content, post.memoryText, filter));

    setTimeout(() => {
      html2canvas(collageElement).then(canvas => {
        const link = document.createElement('a');
        link.download = 

 `collage-${post.id}.png`;
        link.href = canvas.toDataURL();
        link.click();
        document.body.removeChild(collageElement);
      });
    }, 100);
  };

  const handleImageEdit = (type: string, value: number) => {
    if (selectedImage) {
      setCollageImages(prevImages =>
        prevImages.map(img =>
          img.id === selectedImage.id
            ? { ...img, [type]: value }
            : img
        )
      );
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLImageElement>, image: Photo) => {
    setSelectedImage(image);
    e.dataTransfer.setData('text/plain', image.id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const imageId = e.dataTransfer.getData('text');
    const collageRect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - collageRect.left) / collageRect.width) * 100;
    const y = ((e.clientY - collageRect.top) / collageRect.height) * 100;

    setCollageImages(prevImages =>
      prevImages.map(img =>
        img.id === imageId ? { ...img, x, y } : img
      )
    );
  };

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    setFilterAnchorEl(null);
  };

  return (
    <Box>
      <ShareMemoryBox>
        <MemoryInput>
          <Avatar sx={{ marginRight: 2 }} />
          <TextField
            fullWidth
            variant="standard"
            placeholder="Share a memory"
            value={memoryText}
            onChange={(e) => setMemoryText(e.target.value)}
            InputProps={{
              disableUnderline: true,
            }}
          />
        </MemoryInput>
        <IconsBox>
          <Box>
            <Tooltip title="Add to collage">
              <IconButton size="small" onClick={triggerCollageFileInput}>
                <ImageIcon size={20} />
              </IconButton>
            </Tooltip>
            <IconButton size="small">
              <Link size={20} />
            </IconButton>
            <IconButton size="small">
              <MapPin size={20} />
            </IconButton>
            <IconButton size="small">
              <Smile size={20} />
            </IconButton>
          </Box>
          {collageImages.length > 0 && (
            <>
              <Tooltip title="View collage">
                <IconButton size="small" onClick={() => setShowCollagePreview(true)}>
                  <GridIcon size={20} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Change layout">
                <IconButton size="small" onClick={handleLayoutChange}>
                  <LayoutTemplate size={20} />
                </IconButton>
              </Tooltip>
            </>
          )}
        </IconsBox>
      </ShareMemoryBox>

      <Grid container spacing={3}>
        {posts.map(post => (
          <Grid item xs={12} sm={6} md={4} key={post.id}>
            <PhotoCard onClick={() => openModal(post)}>
              {post.type === 'photo' ? (
                <CardMedia component="img" image={(post.content as Photo).url} alt="Uploaded memory" />
              ) : (
                renderCollage(post.content as Photo[], post.memoryText, post.filter)
              )}
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: 'rgba(0,0,0,0.6)',
                color: 'white',
                padding: 1,
              }}>
                <Typography variant="caption">
                  {post.type === 'photo' ? 'Memory' : 'Collage'} #{post.id.slice(0, 4)}
                </Typography>
              </Box>
            </PhotoCard>
          </Grid>
        ))}
      </Grid>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*"
        multiple
      />

      <input
        type="file"
        ref={collageFileInputRef}
        onChange={handleCollageFileChange}
        style={{ display: 'none' }}
        accept="image/*"
        multiple
      />

      <Modal open={showCollagePreview} onClose={() => setShowCollagePreview(false)}>
        <ModalContent>
          <IconButton
            onClick={() => setShowCollagePreview(false)}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <X />
          </IconButton>
          <Typography variant="h6" sx={{ marginBottom: 2 }}>Collage Preview</Typography>
          <Box
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {renderCollage(collageImages, memoryText, currentFilter)}
          </Box>
          <CollageToolbar>
            <Tooltip title="Move">
              <IconButton>
                <Move />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom In">
              <IconButton onClick={() => handleImageEdit('scale', (selectedImage?.scale || 1) + 0.1)}>
                <ZoomIn />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom Out">
              <IconButton onClick={() => handleImageEdit('scale', Math.max(0.1, (selectedImage?.scale || 1) - 0.1))}>
                <ZoomOut />
              </IconButton>
            </Tooltip>
            <Tooltip title="Rotate">
              <IconButton onClick={() => handleImageEdit('rotation', ((selectedImage?.rotation || 0) + 90) % 360)}>
                <RotateCw />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Text">
              <IconButton onClick={() => setMemoryText(prevText => prompt('Edit memory text:', prevText) || prevText)}>
                <Edit3 />
              </IconButton>
            </Tooltip>
            <Tooltip title="Apply Filter">
              <IconButton onClick={(e) => setFilterAnchorEl(e.currentTarget)}>
                <Palette />
              </IconButton>
            </Tooltip>
          </CollageToolbar>
          {selectedImage && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Rotation</Typography>
              <Slider
                value={selectedImage.rotation}
                onChange={(_, newValue) => handleImageEdit('rotation', newValue as number)}
                min={0}
                max={360}
                step={1}
              />
            </Box>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handlePostCollage}
            sx={{ marginTop: 2 }}
          >
            Post Collage
          </Button>
        </ModalContent>
      </Modal>

      {selectedPost && (
        <Modal open={true} onClose={closeModal}>
          <ModalContent>
            {selectedPost.type === 'photo' ? (
              <CardMedia component="img" image={(selectedPost.content as Photo).url} alt="Selected memory" />
            ) : (
              renderCollage(selectedPost.content as Photo[], selectedPost.memoryText, selectedPost.filter)
            )}
            <IconButton onClick={closeModal} sx={{ position: 'absolute', top: 8, right: 8 }}>
              <X />
            </IconButton>
            <Typography variant="body1" sx={{ mt: 2 }}>{selectedPost.memoryText}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', marginTop: 2 }}>
              <IconButton>
                <Heart />
              </IconButton>
              <IconButton>
                <MessageCircle />
              </IconButton>
              <IconButton>
                <Send />
              </IconButton>
              <IconButton>
                <Bookmark />
              </IconButton>
              {selectedPost.type === 'collage' && (
                <IconButton onClick={() => downloadCollage(selectedPost)}>
                  <Download />
                </IconButton>
              )}
            </Box>
          </ModalContent>
        </Modal>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {Object.keys(layouts).map((layout) => (
          <MenuItem key={layout} onClick={() => handleLayoutSelect(layout as keyof typeof layouts)}>
            {layout.charAt(0).toUpperCase() + layout.slice(1)}
          </MenuItem>
        ))}
      </Menu>

      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box p={2}>
          <Typography variant="subtitle1" gutterBottom>Choose a filter</Typography>
          {Object.keys(filters).map((filter) => (
            <Button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              variant={currentFilter === filter ? 'contained' : 'outlined'}
              sx={{ m: 0.5 }}
            >
              {filter}
            </Button>
          ))}
        </Box>
      </Popover>
    </Box>
  );
}